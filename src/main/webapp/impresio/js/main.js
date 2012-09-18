window.addEventListener('load', function() {


    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame ||
                            window.oRequestAnimationFrame || function(fun, elem) {setTimeout(fun, 10)};



    function $(selector, el) {
        if (!el) el = document;
        return el.querySelector(selector);
    }

    var userVideo = $('#userVideo');

    function gotUserMedia(stream) {
        console.log("got user media!")
        if (window.webkitURL) {
            userVideo.src = webkitURL.createObjectURL(stream);
        } else if(window.URL) {
            userVideo.src = window.URL.createObjectURL(stream);
        }
    }

    function userMediaFailed(err) {
        console.log("Could not getUserMedia: " + err)
    }

    var gum = window.navigator.getUserMedia ||
        window.navigator.webkitGetUserMedia ||
        window.navigator.mozGetUserMedia;

    if (gum) {
        gum.call(window.navigator, { video:true, audio:false },
            gotUserMedia,
            userMediaFailed);
    } else {
        console.log('Web camera streaming not supported');
        alert('Web camera streaming not supported by your browser. Try Chrome or Opera');
    }


    var outputCanvas = $('#output');
    var backGroundImage= $('#backgroundimg');
    var foreGroundImage= $('#foregroundimg');
    var output = outputCanvas.getContext('2d');
    var bufferCanvas = $('#buffer');
    var buffer = bufferCanvas.getContext('2d');
    var vbufferCanvas = $('#vbuffer');
    var vbuffer = vbufferCanvas.getContext('2d');
    var width = outputCanvas.width;
    var height = outputCanvas.height;
    var interval;
    var video = $('#video');

    var sensitivitySlider = $('#sensitivity');

    var fliphorizontally = $('#fliphorizontally');
    var showebsite = $('#showebsite');
    var scalebsite = $('#scalewebsite');
    var showvideo = $('#showvideo');
    var showfore= $('#showfore');
    var showback= $('#showback');
    var showpreso = $('#showpreso');
    var slidenr = $('#slidenr');
    var prevslide = $('#prevslide');
    var nextslide = $('#nextslide');
    var rect = $("#rect");

    var websiteFrame = $('#websiteFrame');

    var numpixSpan = $('#numpix');

    var scale = 3.0;

    var targetRed = 24;
    var targetGreen = 85;
    var targetBlue = 183;

    var currentSlide = 1;
    var numberOfSlides = 23;

    var slideThresholdLow = 400;
    var slideWasHidden = false;
    var slideWasShown = true;
    var slideThresholdHigh = 3000;


    var insta = $('#insta');

    var last = new Date().getTime();

    var lastElem = $('#last');

    var chromakey = $('#chromakey');

    var presoFiles;

    var backFiles;
    var currentBack = 0;


    $('#output').style['-webkit-transform'] = 'scale(' + scale + ')';
    $('#output').style.OTransform = 'scale(' + scale + ')';

    sensitivitySlider.addEventListener('change', function() {
        $('#sensitivitylabel').innerHTML = this.value;
    });

    $('#url').addEventListener('change', function() {
        websiteFrame.src = this.value;
    });

    $('#go').addEventListener('click', function() {
        websiteFrame.src = $('#url').value;
        return false
    });

    showpreso.addEventListener('click', function () {
        if (showpreso.checked) {
            gotoSlide(1);
        }
    }, false);

    prevslide.addEventListener('click', function() {
        prevSlide()
    }, false);

    nextslide.addEventListener('click', function() {
        nextSlide()
    }, false);

    slidenr.addEventListener('keypress', function(evt) {
        if(evt.keyCode == 13)
            gotoSlide(this.value)
    }, false);


    $('#songinfo').addEventListener('click', function() {
        var url = 'http://en.wikipedia.org/wiki/Billie_Jean';
        $('#url').value=url;
        websiteFrame.src=url;
    });


    $('#presofiles').addEventListener('change', function(evt) {
        if(this.files.length > 0) {
            presoFiles = this.files;
            numberOfSlides = this.files.length;
            $('#numberofslides').innerHTML = '/ ' + numberOfSlides;
            $('#showpreso').removeAttribute("disabled");
            $('#slidenr').removeAttribute("disabled");
            $('#nextslide').removeAttribute("disabled");
            $('#prevslide').removeAttribute("disabled");
            gotoSlide(1);
        }
    });

    $('#presoselect').addEventListener('click', function(evt) {
        $('#presofiles').click();
        evt.preventDefault();
    });
    function nextSlide() {
        currentSlide++;
        if (currentSlide > numberOfSlides) {
            currentSlide = 1;
        }
        gotoSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide--;
        if (currentSlide < 1) {
            currentSlide =numberOfSlides;
        }
        gotoSlide(currentSlide);
    }

    function gotoSlide(slideNum) {
        currentSlide = slideNum;
        var url;
        if(window.URL) {
            url = window.URL.createObjectURL(presoFiles[slideNum-1]);
        } else if(window.webkitURL) {
            url = window.webkitURL.createObjectURL(presoFiles[slideNum-1]);
        }

        if(url) {
            websiteFrame.src = url;
            slidenr.value = slideNum;
        }
    }

    function processFrame() {

        if (fliphorizontally.checked) {
            buffer.save();
            buffer.scale(-1, 1);
            buffer.drawImage(userVideo, -width, 0, width, height);
            buffer.restore()
        } else {
            buffer.drawImage(userVideo, 0, 0, width, height);
        }


        var sensitivity = sensitivitySlider.value;

        // this can be done without alphaData, except in Firefox which doesn't like it when image is bigger than the canvas
        var image = buffer.getImageData(0, 0, width, height), imageData = image.data;


        var numpix = 0;
        var leftmost = -1;
        var rightmost = -1;
        var topmost = -1;
        var bottommost = -1;


        if (chromakey.checked) {
            for (var i = 0, len = imageData.length; i < len; i = i + 4) {
                var red = imageData[i];
                var green = imageData[i + 1];
                var blue = imageData[i + 2];
                var diff = Math.sqrt(Math.pow(targetRed - red, 2) + Math.pow(targetGreen - green, 2) + Math.pow(targetBlue - blue, 2));

                if (diff < sensitivity) {
                    imageData[i + 3] = 0;
                    numpix ++;

                    var x = (i / 4) % width;
                    var y = (i / 4) / width;
                    leftmost = leftmost == -1 ? x : Math.min(leftmost, x);
                    rightmost = rightmost == -1 ? x : Math.max(rightmost, x);

                    topmost = topmost == -1 ? y : Math.min(topmost, y);
                    bottommost = bottommost == -1 ? y : Math.max(bottommost, y);
                }
            }
        }


        var kwidth = rightmost - leftmost;
        var kheight = bottommost - topmost;

        var videoThreshold = 3000;


        var shouldInsta = insta.checked;

        if (showvideo.checked && numpix > videoThreshold) {
            vbuffer.drawImage(video, leftmost, topmost, kwidth, kheight);

            var elephantData = vbuffer.getImageData(0, 0, width, height).data;

            for (var i = 3, len = imageData.length; i < len; i = i + 4) {
                if (imageData[i] == 0) {
                    imageData[i] = 255;
                    imageData[i - 3] = elephantData[i - 3];
                    imageData[i - 2] = elephantData[i - 2];
                    imageData[i - 1] = elephantData[i - 1];
                }

            }

        }

        if (showpreso.checked) {
            if (numpix > slideThresholdHigh && slideWasHidden) {
                slideWasShown = true;
            } else if (numpix < slideThresholdLow && slideWasShown) {
                slideWasHidden = true;
                slideWasShown = false;
                nextSlide();
                console.log('nextslide')
            }
        }

        if (shouldInsta) {
            for (var i = 3, len = imageData.length; i < len; i = i + 4) {
                imageData[i - 3] *= 3;
                imageData[i - 2] *= 2;
                imageData[i - 1] -= 40;
            }
        }

        if (!showvideo.checked || numpix < videoThreshold) {
            video.pause();
        } else if (video.paused) {
            video.play()
        }


        numpixSpan.innerHTML = numpix; //+ ': ' +leftmost +'/' +topmost +' , ' + kwidth +'/' + kheight;
        output.putImageData(image, 0, 0);


        if (rect.checked && !showebsite.checked && !showvideo.checked && !showpreso.checked) {
            output.strokeStyle = '#fff';
            output.fillStyle = 'rgba(0,0,0,0.2';
            output.lineWidth = 1;
            output.beginPath();
            output.rect(leftmost, topmost, kwidth, kheight);
            output.stroke()
        }

        if (showebsite.checked || (showpreso.checked && numpix > slideThresholdHigh)) {
            if (numpix < 100) {
                websiteFrame.style.display = 'none';
            } else {
                websiteFrame.style.display = 'block';
            }

            var drawWith = kwidth * scale;
            var kscale = scalebsite.checked ? (drawWith) / (showpreso.checked ? 1024 : 1280) : 1;

            websiteFrame.style.marginLeft = (leftmost * scale) + 'px';
            websiteFrame.style.marginTop = (topmost * scale) + 'px';

            websiteFrame.style.width = (kwidth * scale / kscale) + 'px';
            websiteFrame.style.height = (kheight * scale / kscale) + 'px';
            websiteFrame.style['-webkit-transform'] = 'scale(' + kscale + ')'
            websiteFrame.style.OTransform = 'scale(' + kscale + ')'
        } else {
            websiteFrame.style.display = 'none';
        }

        var now = new Date().getTime();
        lastElem.innerHTML = parseInt(1000 / (now - last));
        last = now;

        requestAnimationFrame(processFrame, outputCanvas);
    }


    userVideo.addEventListener('play', function() {
        requestAnimationFrame(processFrame, outputCanvas);
    }, false);

    userVideo.addEventListener('ended', function() {
        userVideo.play();
    }, false);


    var chromaSelector = function(evt) {

        var x = (evt.x - outputCanvas.offsetLeft) / scale;
        var y = (evt.y - outputCanvas.offsetTop) / scale;


        var pixel = buffer.getImageData(parseInt(x), parseInt(y), 1, 1).data;
        targetRed = pixel[0];
        targetGreen = pixel[1];
        targetBlue = pixel[2];

        var backgroundColor = 'rgb(' + targetRed +',' +targetGreen +',' +targetBlue +')';
        $('#selectedColor').style.backgroundColor = backgroundColor;
        $('#selectedColor').title = backgroundColor;



    };

    foreGroundImage.addEventListener('click', chromaSelector , false);
    outputCanvas.addEventListener('click', chromaSelector , false);


    showfore.addEventListener("click", function(evt) {
        foreGroundImage.style.visibility = evt.target.checked ? "visible" : "hidden";
    });
    showback.addEventListener("click", function(evt) {
        backGroundImage.style.visibility = evt.target.checked ? "visible" : "hidden";
    });

    $('#backselect').addEventListener('click', function(evt) {
        $('#backfiles').click();
        evt.preventDefault();
    });

    $('#backfiles').addEventListener('change', function(evt) {
        if(this.files.length > 0) {
            var backs = new Object();
            var fores = new Object();

            for(var i = 0; i < this.files.length;i++) {
                var file = this.files[i];
                var isfore = new RegExp(".*_fg\.png").test(file.name);
                if(isfore) {
                    var root = file.name.substr(0, file.name.indexOf("_fg.png"));
                    fores[root] = file;
                } else {
                    var root = file.name.substr(0, file.name.indexOf(".png"));
                    backs[root] = file;
                }
            }
            backFiles = new Array();

            for(var i in backs) {
                var pair = new Object();
                pair.back = backs[i];
                pair.fore = fores[i];
                backFiles.push(pair);
            }

            nextBack();


        }
    });

    function nextBack() {
        backGroundImage.src = window.webkitURL.createObjectURL(backFiles[currentBack].back);
        foreGroundImage.src = window.webkitURL.createObjectURL(backFiles[currentBack].fore);
        foreGroundImage.style.visibility = "visible";
        backGroundImage.style.visibility = "visible";
        currentBack = currentBack == backFiles.length -1 ? 0 : currentBack+1;
    }


    window.addEventListener('keydown', function(event) {

        if (showpreso.checked) {
            if (event.keyCode == 34) {
                event.preventDefault();
                nextSlide();
                return false;
            }
            if (event.keyCode == 33) {
                event.preventDefault();
                prevSlide();
                return false;
            }
        }
        return true;
    }, true);


    function zoomPanTilt() {
        var trans = ""


        var x = Math.round(960*$("#pan").value/100);
        var y = Math.round(720*$("#tilt").value/100);

        trans += " translate(" +x +"px," +y +"px)";

        trans += ' scale(' + scale*$("#zoom").value/100 + ')';

        $('#output').style['-webkit-transform'] = trans;
        $('#output').style.OTransform = trans;

    }
    $("#zoom").addEventListener("change", zoomPanTilt);

    $("#pan").addEventListener("change", zoomPanTilt);

    $("#tilt").addEventListener("change", zoomPanTilt);

    $("#resetzoom").addEventListener("click", function(evt) {
        $("#zoom").value = 100;
        $("#pan").value = 0;
        $("#tilt").value = 0;
        zoomPanTilt();
        evt.preventDefault();
        return false;
    });

    $("#save").addEventListener("click", function(evt) {

        var cvs = document.createElement("canvas");
        cvs.setAttribute("width", 960)
        cvs.setAttribute("height", 720)
        var ctx = cvs.getContext("2d");

        if(showback.checked)
            ctx.drawImage(backGroundImage, 0, 0)

        var x = $("#pan").value*960/100;
        var y = $("#tilt").value*720/100;;
        var w = 960 * $("#zoom").value /100;
        var h = 720 * $("#zoom").value /100;
        ctx.drawImage(outputCanvas, x, y, w, h)

        if(showfore.checked)
            ctx.drawImage(foreGroundImage, 0, 0)

        var dataURL = cvs.toDataURL("image/png");

        $("#dataURL").value= dataURL;

        $("#download").href= dataURL;
        $("#download").style.display = "inline";

        var div = document.createElement("div");
        var img = document.createElement("img");
        img.src = dataURL;
        img.style.width = "320px";
        img.style.height = "240px";
        div.appendChild(img);
        $("#images").appendChild(div);

        div.addEventListener("click", function(evt) {

            $("#emailer").style.display = "block";
            $("#email").value= "";

        });
    })

    function sendEmail() {

        var params = "data=" + encodeURIComponent($("#dataURL").value);
        var email = $("#email").value;
        if(email && email != "") {
            params += "&email=" + encodeURIComponent(email);
        }

        var xhr = new XMLHttpRequest();

        xhr.open("POST", "saveimage", true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhr.setRequestHeader("Content-length", params.length);
        xhr.onreadystatechange = function() {

        };


        xhr.send(params);

        $("#emailer").style.display = "none";
    }
    $("#email").addEventListener("keyup", function(evt) {

        if(evt.keyCode == 13) {

           sendEmail();
        }
    })

    $("#emailsubmit").addEventListener("click", sendEmail);
});
