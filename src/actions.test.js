import {
  describe, expect, it, vi,
} from 'vitest';

const core = vi.hoisted(() => ({
  graphql: vi.fn((payload, type, meta) => ({ payload, type, meta })),
  openBlob: vi.fn(),
}));

vi.mock('@openimis/fe-core', async () => ({
  ...(await vi.importActual('@openimis/fe-core/helpers/api')),
  ...(await vi.importActual('@openimis/fe-core/helpers/i18n')),
  ...(await vi.importActual('@openimis/fe-core/actions')),
  ...core,
}));

const actions = await import('./actions');
const { globalId } = await import('@openimis/fe-core/testing');

const query = (result) => result.payload.replace(/\s+/g, ' ');
const modulesManager = { getRef: () => actions.BATCH_RUN_PICKER_PROJECTION };
const runThunk = () => {
  const dispatch = vi.fn((action) => (typeof action === 'function' ? action(dispatch) : action));
  return dispatch;
};

describe('claim batch actions', () => {
  describe('batch run picker', () => {
    it.each([
      ['a district', [{ uuid: 'region-1' }, { uuid: 'district-1' }], 'location_Uuid: "district-1"'],
      ['a region', [{ uuid: 'region-1' }, null], 'location_Uuid: "region-1"'],
      ['the whole country', [null, null], 'location_Isnull: true'],
    ])('scopes the runs to %s, newest first', (_label, [region, district], filter) => {
      const result = actions.fetchBatchRunPicker(modulesManager, region, district);

      expect(result.type).toBe('CLAIM_BATCH_CLAIM_BATCH_PICKER');
      expect(query(result)).toContain(`batchRuns(orderBy: "-runDate",${filter})`);
      expect(query(result)).toContain('edges { node { id,runDate }');
    });
  });

  it('asks for a counted page of batch run summaries', () => {
    const result = actions.fetchBatchRunSummaries(modulesManager, ['first: 10']);

    expect(result.type).toBe('CLAIM_BATCH_CLAIM_BATCH_SEARCHER');
    expect(query(result)).toContain('batchRunsSummaries(first: 10) { totalCount');
    expect(query(result)).toContain('runYear,runMonth,productLabel,careType,calcDate,index');
  });

  it('asks for the batch runs with their location', () => {
    const result = actions.fetchBatchRunWithLocationPicker(['first: 10']);

    expect(result.type).toBe('CLAIM_BATCH_CLAIM_BATCH_PICKER_WITH_LOCATION');
    expect(query(result)).toContain('batchRuns(first: 10) { totalCount');
    expect(query(result)).toContain('location{code name}');
  });

  describe('processBatch', () => {
    it('processes a location by its decoded id', () => {
      const result = actions.processBatch({ id: globalId('LocationGQLType', '17') }, 2024, 3, 'Process March');

      expect(query(result)).toContain('mutation processBatch');
      expect(query(result)).toContain('locationId: 17 month: 3 year: 2024');
      expect(query(result)).toContain('clientMutationLabel: "Process March"');
    });

    it('processes the whole country when no location is given', () => {
      const sent = query(actions.processBatch(null, 2024, 3, 'Process March'));

      expect(sent).toContain('month: 3 year: 2024');
      expect(sent).not.toContain('locationId');
    });

    it('routes the request and failure through the shared mutation types', () => {
      expect(actions.processBatch(null, 2024, 3, 'Process March').type).toEqual([
        'CLAIM_BATCH_MUTATION_REQ',
        'CLAIM_BATCH_PROCESS_RESP',
        'CLAIM_BATCH_MUTATION_ERR',
      ]);
    });

    it('records the mutation id it sent and serialises the details', () => {
      const result = actions.processBatch(null, 2024, 3, 'Process March', { month: 3 });

      expect(result.meta).toMatchObject({
        clientMutationLabel: 'Process March',
        clientMutationDetails: '{"month":3}',
      });
      expect(result.meta.requestedDateTime).toBeInstanceOf(Date);
      expect(query(result)).toContain(`clientMutationId: "${result.meta.clientMutationId}"`);
    });
  });

  describe('generateReport', () => {
    const intl = { messages: {}, formatMessage: ({ id }) => id };
    const blob = new Blob(['%PDF']);

    const generate = async (prms, response = { ok: true, blob: async () => blob }) => {
      const fetch = vi.fn(async () => response);
      vi.stubGlobal('fetch', fetch);
      const dispatch = runThunk();
      await actions.generateReport(prms, intl)(dispatch);
      return { url: fetch.mock.calls[0][0], dispatch };
    };

    it('asks the report endpoint for every selected parameter', async () => {
      const prms = {
        region: { id: globalId('LocationGQLType', '1'), code: 'R1', name: 'Region One' },
        district: { id: globalId('LocationGQLType', '2'), code: 'D1', name: 'District One' },
        product: { id: globalId('ProductGQLType', '3'), code: 'P1', name: 'Basic' },
        batchRun: { id: globalId('BatchRunGQLType', '4'), runDate: '2024-02-03T10:15:00' },
        healthFacility: { id: globalId('HealthFacilityGQLType', '5'), code: 'HF1', name: 'Clinic' },
        healthFacilityLevel: 'C',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        group: 'H',
        showClaims: true,
      };

      const { url } = await generate(prms);

      expect(url.pathname).toMatch(/\/claim_batch\/report\/$/);
      expect(Object.fromEntries(url.searchParams)).toEqual({
        locationId: '2',
        regionCode: 'R1',
        regionName: 'Region One',
        prodId: '3',
        productCode: 'P1',
        productName: 'Basic',
        runId: '4',
        runDate: '2024-02-03',
        hfId: '5',
        hfCode: 'HF1',
        hfName: 'Clinic',
        hfLevel: 'C',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        group: 'H',
        showClaims: 'true',
      });
    });

    it('falls back to the region, then to the whole country, for the location', async () => {
      const region = { id: globalId('LocationGQLType', '1'), code: 'R1', name: 'Region One' };

      expect((await generate({ region })).url.searchParams.get('locationId')).toBe('1');
      expect((await generate({})).url.searchParams.get('locationId')).toBe('0');
    });

    it('sends empty values for what was not selected', async () => {
      const { url } = await generate({});

      expect(url.searchParams.get('prodId')).toBe('0');
      expect(url.searchParams.get('runId')).toBe('0');
      expect(url.searchParams.get('hfId')).toBe('0');
      expect(url.searchParams.get('regionCode')).toBe('');
      expect(url.searchParams.get('dateFrom')).toBe('');
    });

    it('opens the pdf and reports the preview done', async () => {
      const prms = { group: 'H' };
      const { dispatch } = await generate(prms);

      expect(core.openBlob).toHaveBeenCalledWith(blob, expect.stringMatching(/\.pdf$/), 'pdf');
      expect(dispatch).toHaveBeenCalledWith({ type: 'CLAIM_BATCH_PREVIEW_DONE', payload: prms });
    });

    it('stops the preview and alerts the user when the server refuses', async () => {
      const { dispatch } = await generate({}, { ok: false, status: 500, statusText: 'Internal Server Error' });

      expect(core.openBlob).not.toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith({
        type: 'CLAIM_BATCH_PREVIEW_ERROR',
        payload: new Error('Failed to generate report: 500 Internal Server Error'),
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: 'CORE_ALERT',
        payload: { title: 'BatchRun.errorHeader', message: 'BatchRun.errorDetail', detail: undefined },
      });
    });
  });
});
