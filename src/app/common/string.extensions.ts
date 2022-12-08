interface String {
    proper():string
}

String.prototype.proper = function() {
    return this.replace(
        /\w\S*/g,
        (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

interface Date {
    toStandard():string
}

Date.prototype.toStandard = function() {
    const thisDate = this;

    const yyyy = thisDate.getFullYear().toString();
    const yy = thisDate.getFullYear().toString().slice(2,4);
    const mm = (thisDate.getMonth()+1).toString().padStart(2,'0');
    const dd = thisDate.getDate().toString().padStart(2,'0');
    const hh = thisDate.getHours().toString().padStart(2,'0');
    const nn = thisDate.getMinutes().toString().padStart(2,'0');
    // return `${yyyy}-${mm}-${dd} ${hh}:${nn}`;
    return `${dd}.${mm}.${yy} ${hh}:${nn}`;
}