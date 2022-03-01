export function getBatchRunLabel(br) {
    return !!br ? `${br.runDate.substring(0,br.runDate.indexOf('T'))} ${br.location.code} ${br.location.name}: ${br.runYear}-${br.runMonth}` : "";
}
