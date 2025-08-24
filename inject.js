(function () {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;     //

    /* Here we copied and saved the original prototype of open()
        and send() by XMLHtttpRequest.prototype.method . we saved their original working model means prototype
        bcoz we wanted to override . so copied the prototype
    */


    // Hooking the .open() method that is changing the original functionality of open() method to our need
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    }

    // this refers to current request instance and _url is our var name and assigned value as website url
    //so this._url has url of website annd used in send()

    XMLHttpRequest.prototype.send = function (body) {
        this.addEventListener("load", function () {
            const data = {
                url: this._url,
                status: this.status,
                response: this.response
            };
            // this.response ,status,etc are builtin property names and resposne gives the body 

            // we grabbed the data now we have to raise an event to get it accessed by content.js
            window.dispatchEvent(new CustomEvent("xhrDataFetched", { detail: data }));
            // we raised an custom event on window and given name to it as xhrDataFetched and anyone in window can listen it .
        })
        return originalSend.apply(this, arguments);
    };
})();




