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