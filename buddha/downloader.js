function download(url)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");
    var hasResponseType = "responseType" in xhr;
    if (hasResponseType) xhr.responseType = "arraybuffer";
    xhr.send(null);
    if (xhr.status != 200) alert('Problem downloading ' + url);
    return hasResponseType ? xhr.response : xhr.mozResponseArrayBuffer;
}
self.onmessage = function(e) {
    var positionArray = download("BuddhaPositions.bin");
    var normalsArray = download("BuddhaNormals.bin");
    var indexArray = download("BuddhaTriangles.bin");
    var retval = {
        'positions' : positionArray,
        'normals' : normalsArray,
        'indices' : indexArray
    };
    self.postMessage(retval);
};
