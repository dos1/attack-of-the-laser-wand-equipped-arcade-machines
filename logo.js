(function () {

    var samples = {};
    var counter = 0;

    var frame = 0;
    var introskip = false;

    var dosowisko = { enabled: true, alpha: 0, size: 5 };

    var logo, coin;

    var glCanvas, gl, buffer, texture;

    function glInit() {
 
        glCanvas = document.getElementById('glcanvas');
        gl = glCanvas.getContext('webgl');
        glCanvas.width = 320*2;
        glCanvas.height = 180*2;
 
        var shaderScript;
        var shaderSource;
        var vertexShader;
        var fragmentShader;
        
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, 
            new Float32Array([
                -1.0, -1.0, 
                1.0, -1.0, 
                -1.0,  1.0, 
                -1.0,  1.0, 
                1.0, -1.0, 
                1.0,  1.0
            ]), gl.STATIC_DRAW);

        shaderScript = document.getElementById("vertexshader");
        shaderSource = shaderScript.data;
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaderSource);
        gl.compileShader(vertexShader);

        shaderScript   = document.getElementById("fragmentshader");
        shaderSource   = shaderScript.data;
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);	
        gl.useProgram(program);
        
/*
        console.log(gl.getShaderInfoLog(vertexShader));
        console.log(gl.getShaderInfoLog(fragmentShader));
        console.log(gl.getProgramInfoLog(program));
*/

        gl.activeTexture(gl.TEXTURE0);
        texture = gl.createTexture(); 
    }
 

    function glRender() {
 
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
 
    
        positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
        texLoc = gl.getUniformLocation(program, 'tex');
  
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas.canvas);

        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(texLoc, 0);
  
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function main() {
        //enable_debug('debug');
        glInit();
        allegro_init_all("logo_canvas", 320, 180);
        clear_to_color(canvas,makecol(32, 32, 32));
        glRender();
        canvas.mozImageSmoothingEnabled = false;
        canvas.webkitImageSmoothingEnabled = false;
        canvas.msImageSmoothingEnabled = false;
        canvas.imageSmoothingEnabled = false;
        
        font = load_font('DejaVuSansMono.ttf');
        
        logo = load_bmp('logo.png');
        coin = load_bmp('coin.png');
        
        samples.dosowisko = load_sample('dosowisko.ogg');
        samples.kbd = load_sample('kbd.ogg');
        samples.key = load_sample('key.ogg');
                
        dosowisko.checkerboard = create_bitmap(320, 180);
        for (var i=0; i<=320; i=i+2) {
            for (var j=0; j<=180; j=j+2) {
                putpixel(dosowisko.checkerboard, i, j, makecol(0, 0, 0, 64));
            }
        }
        var started = false;
        
        ready(function() {
            window.sceneApp();
            setTimeout(function() {
                play_sample(samples.dosowisko);
                dosowisko.length = 1;
                started = true;
                
                setTimeout(function() {
                    if (!dosowisko.enabled) return;
                    play_sample(samples.kbd);

                    dosowisko.interval = setInterval(function() {
                        dosowisko.length++;
                    }, 90);
                }, 2000);
                
                setTimeout(function() {
                    if (!dosowisko.enabled) return;
                    stop_sample(samples.kbd);
                    clearInterval(dosowisko.interval);
                    dosowisko.interval = null;
                    dosowisko.length = 42;
                }, 3500);

                setTimeout(function() {
                    if (!dosowisko.enabled) return;
                    play_sample(samples.key);
                    dosowisko.blank = true;
                }, 5200);                
                
                setTimeout(function() {
                    if (!dosowisko.enabled) return;
                    dosowisko.enabled = false;
                }, 6500);
                
            }, 3000);
            
            loop(function(){
                if (started) {
                    counter+=2;
                    dosowisko.alpha+=4;
                    dosowisko.size-=0.16;
                    if (counter % 30 === 0) dosowisko.cursor = !dosowisko.cursor;
                }
                        
                if (!frame) frame = requestAnimationFrame(draw);

            },BPS_TO_TIMER(30));

            var draw = function() {
                frame = 0;
                clear_to_color(canvas,makecol(14, 14, 14));

                if (dosowisko.enabled) {
                    if (!dosowisko.blank) {
                        clear_to_color(canvas,makecol(32, 32, 32));
                        textout_centre (canvas, font, ("# dosowisko.net".slice(0, dosowisko.length)) + (dosowisko.cursor ? "_" : " "), 320/2, 180/2 + (20 + Math.max(0,dosowisko.size))/2, 20 + Math.max(0,dosowisko.size), makecol(255,255,255, Math.min(255, dosowisko.alpha)));
                        draw_sprite(canvas, dosowisko.checkerboard, 320/2, 180/2);
                    }
                } else {
                    draw_sprite(canvas, logo, 320/2, 180/2 + Math.sin(Date.now()/256)*10 + 5);   
                    if ((Date.now() % 1000) >= 500) {
                        draw_sprite(canvas, coin, 320/2, 180/2);                                  
                    }
                }
                        
                glRender();
                        
            };
        }, function() { clear_to_color(canvas,makecol(32, 32, 32)); glRender();});
        return 0;
    }

    window.logoApp = main;

})();
