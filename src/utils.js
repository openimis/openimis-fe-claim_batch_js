export function batchRunLabel(br) {
    return !!br ? `${br.runDate.substr(0,br.runDate.indexOf('T'))} ${br.location.code} ${br.location.name}: ${br.runYear}-${br.runMonth}` : "";
}
