(function() {

    window.gameStarted = false;
    
    var cameraPos = {x:0, y:0, z:0 };
    var cameraDiff = new THREE.Vector3(0,0,0);
    
    var gameHasStarted = false;
    var gameHasSetup = false;

    AFRAME.registerComponent('trigger-listener', {
        init: function () {
            var el = this.el;
            //$('#dos')[0].setAttribute('visible', true);
            el.addEventListener('triggerdown', function (evt) {
                el.setAttribute('line', "color: red; opacity: 1");
                console.log('down');
            });
            el.addEventListener('triggerup', function (evt) {
                el.setAttribute('line', "color: yellow; opacity: 0.3");
                console.log('up'); //, $(el).find('*'));
            });
        }
    });


    AFRAME.registerComponent('mouse-listener', {
        init: function () {
            var el = this.el;
            //$('#dos')[0].setAttribute('visible', true);
            el.addEventListener('mouseenter', function (evt) {
                // el.setAttribute('line', "color: red; opacity: 1");
                console.log('enter');
                $(el).find('[gray]').attr('color', 'silver');
            });
        
            el.addEventListener('mousedown', function (evt) {
                // el.setAttribute('line', "color: red; opacity: 1");
                $(el).find('.explosion')[0].setAttribute('visible', 'true');
                $(el).find('.explosion .sound')[0].components.sound.playSound();
                $(el).find('.machine').remove();
                setTimeout(function() { $(el).find('.explosion')[0].setAttribute('visible', 'false'); }, 1000);
                setTimeout(function() { $(el).remove(); }, 4000);
            });
        
            el.addEventListener('mouseleave', function (evt) {
                //el.setAttribute('line', "color: yellow; opacity: 0.3");
                console.log('leave'); //, $(el).find('*'));
                $(el).find('[gray]').attr('color', 'gray');
            });
        }
    });

    AFRAME.registerComponent('coin-listener', {
        init: function () {
            var el = this.el;

            el.addEventListener('mouseenter', function (evt) {
                console.log('enter');
                el.setAttribute('color', 'yellow');
            });
    
            el.addEventListener('mousedown', function (evt) {
                console.log('start');
                if (!gameHasStarted) {
                    $(el).parent().parent()[0].setAttribute('position', "0 0 -1.75");
                    $(el).parent().parent().find('.explosion')[0].setAttribute('visible', 'true');
                    $(el).parent().parent().find('.explosion .sound')[0].components.sound.playSound();
                    $(el).parent().parent().find('.machine')[0].setAttribute('visible', 'false');
                    gameHasStarted = true;
                    gameHasSetup = false;
                    window.gameStarted = true;
                    $('#music')[0].components.sound.playSound();
                    setTimeout(function() { $(el).parent().parent().find('.explosion')[0].setAttribute('visible', 'false'); }, 1000);
                }

                
            });
    
            el.addEventListener('mouseleave', function (evt) {
                //el.setAttribute('line', "color: yellow; opacity: 0.3");
                console.log('leave'); //, $(el).find('*'));
                el.setAttribute('color', '');
            });
        }
    });


    AFRAME.registerComponent("camera-listener", {
        schema: {},
        tick: function() {
            var newcameraPos = this.el.components.camera.camera.parent.position;
            var rot = this.el.components.camera.camera.parent.rotation;
            
            var testpos = new THREE.Vector3(newcameraPos.x, newcameraPos.y, newcameraPos.z).sub(new THREE.Vector3(cameraPos.x, cameraPos.y, cameraPos.z));
            var difference = new THREE.Vector3(testpos.x, testpos.y, testpos.z);
            testpos = testpos.applyAxisAngle(new THREE.Vector3(1,0,0), rot.x);
            testpos = testpos.applyAxisAngle(new THREE.Vector3(0,1,0), -rot.y);
            testpos = testpos.applyAxisAngle(new THREE.Vector3(0,0,1), rot.z);
            
            // xyz xzy yxz yzx zxy zyx
            //if (difference.z < -0.01) {  
            //if (testpos.z < -0.01) {
            //difference.x = -difference.x;
            if (testpos.z < -0.001) {
                //console.log(testpos);
                //difference.x = -difference.x;
                difference.y = 0;
                cameraDiff.add(difference.multiplyScalar(3));
            }
  //              }
		//console.log(difference);
		//}

		
//		if (cameraPos.z != newcameraPos.z) {
//		   console.log(cameraPos.z - newcameraPos.z);
//		}
            cameraPos = {x:newcameraPos.x, y:newcameraPos.y, z:newcameraPos.z};
        }
    });
	
    var vr=false;

    $(function() {

        document.querySelector('a-scene').addEventListener('enter-vr', function () {
//        $('.screenshake').attr('position', '0 0 0');
            vr=true;
            $('#camera')[0].setAttribute('wasd-controls', '');
            $('#camera')[0].setAttribute('look-controls', '');
        });

        document.querySelector('a-scene').addEventListener('loaded', function () {
            //console.log(cameraPos);
            document.querySelector('a-scene').exitVR();
            window.logoApp();
        });
    });


    function sceneApp() {

        var shake;

        function screenShake() {
            var shakeCount = 0;
            shake = setInterval(function() {
                $('.screenshake').attr('position', Math.random()/8.0 + ' ' + Math.random()/8.0 + ' ' + Math.random()/8.0);
                shakeCount++;
                if (shakeCount > 42) {
                $('.screenshake').attr('position', '0 0 0');
                    clearInterval(shake);
                }
            }, 10);
        }

        //setTimeout(screenShake, 3000);

        var start = Date.now(), oldt = start, touched = false;

        var speechEnabled = false;

        var gameStarted = false;
        
        var firstFrame = true;
        
        $('#discovr')[0].volume = 0.5;

        function frame() {
            var t = Date.now(); 
            if ((firstFrame) && (t-start >= 200)) {
                $('.loading').remove();
                $('#audio-down')[0].components.sound.playSound();
                firstFrame = false;
            }

            if (!speechEnabled && !gameHasStarted) {
                $('#arcade-template').attr('position', '0 ' + Math.max(0, 5*(9-((t-start)/1000)*3)) + ' -1.5');
            }
            if (!touched) {
                var val =  (10*(9-((t-start)/1000)*3)/90);
                $('.screenshake').attr('rotation', Math.max(0, (val>0.0001) ? Math.sqrt(val,2) : 0 ) * 90 +' 0 0');

                if (t-start >= 3000) {
                    setTimeout(function() {
                        window.startLogo();
                    }, 200);
                    screenShake();
                    touched = true;
                }
            } else {
                
                if (!speechEnabled) {
                    var time = (t-start)/1000 - 3;
                
                    $('.position').attr('position', '0 0 -' + Math.min(1, Math.pow(time/3, 2))*0.8);
                    
                    if (t-start >= 9000) {
                        // enable speech
                        /*
                        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
            var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
            var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

            var spells = [ 'insert coin', 'alohomora', 'alohamora', 'seicento', 'flipendo', 'rictusempra', 'onomatopoeia', 'leviosa', 'wingardium leviosa', 'lumos', 'spongify'];
            var grammar = '#JSGF V1.0; grammar spells; public <spell> = ' + spells.join(' | ') + ' ;'

            var recognition = new SpeechRecognition();
            var speechRecognitionList = new SpeechGrammarList();
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
            recognition.continuous = true;
            recognition.lang = 'en-US';
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.start();

            recognition.onresult = function(event) {
            // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
            // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
            // It has a getter so it can be accessed like an array
            // The [last] returns the SpeechRecognitionResult at the last position.
            // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
            // These also have getters so they can be accessed like arrays.
            // The [0] returns the SpeechRecognitionAlternative at position 0.
            // We then return the transcript property of the SpeechRecognitionAlternative object

            var last = event.results.length - 1;
            var result = event.results[last][0].transcript;
            console.log(result, 'Confidence: ' + event.results[0][0].confidence);
            
            if (result.trim() == 'insert coin') {
                $('#arcade-template').attr('position', '9999 9999 9999');
                gameStarted = true;
            }
            }

            recognition.onspeechend = function() {
            recognition.stop();
            }

            recognition.onnomatch = function(event) {
            //diagnostic.textContent = "I didn't recognise that color.";
            }

            recognition.onerror = function(event) {
            //  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
            }
                        */
                        
                        speechEnabled = true;
                    }
                } 
            //    console.log(cameraDiff);
                if (vr) {
                    $('.position').attr('position', cameraDiff.x + ' ' + cameraDiff.y + ' ' + cameraDiff.z);
                }
                // speech enabled
                    
                
                if (gameHasStarted) {
                    if (!gameHasSetup) {
                        gameHasSetup = true;
                        setInterval(function() {
                            var clone = $('#arcade-template').clone();
                            clone.attr('id', '');
                            clone.attr('mouse-listener', '');
                            clone.attr('position', (Math.random()*20-10) + ' 0 ' + (Math.random()*20-10));
                            clone.find('.machine').attr('rotation', '0 ' + Math.random()*360 + ' 0').attr('visible','true');
                            clone.find('.explosion').attr('visible', 'false');
                            clone.find('.explosion .sound').attr('src', 'url(explosions/'+Math.ceil(Math.random()*5)+'.ogg)');
                            clone.appendTo($('a-scene'));
                        }, 2000);
                    }
                }  
            }
            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }
    
    window.sceneApp = sceneApp;

})();
