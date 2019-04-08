
function dynamicLoad(jsFile, callback ){

    console.log("dynamicLoad : " + jsFile);

    var script = document.createElement('script');
    script.onload = function () {

        if( callback!=null ) callback();
    };

    script.src = jsFile;

    document.head.appendChild(script);
}


function readTextFile(file, to)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                
                to.innerText = allText;
            }
        }
    }
    rawFile.send(null);
}
