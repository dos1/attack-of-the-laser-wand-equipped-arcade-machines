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
            var $parent = $(el).parent().parent();
            //$('#dos')[0].setAttribute('visible', true);
            el.addEventListener('mouseenter', function (evt) {
                // el.setAttribute('line', "color: red; opacity: 1");
                console.log('enter');
                $parent.find('[gray]').attr('color', 'silver');
            });
        
            el.addEventListener('mousedown', function (evt) {
                // el.setAttribute('line', "color: red; opacity: 1");
                $parent.find('.explosion')[0].setAttribute('visible', 'true');
                $parent.find('.explosion .sound')[0].components.sound.playSound();
                $parent.find('.machine').remove();
                $parent.find('a-animation').remove();
                setTimeout(function() { $parent.find('.explosion')[0].setAttribute('visible', 'false'); }, 1000);
                setTimeout(function() { $parent.remove(); }, 4000);
            });
        
            el.addEventListener('mouseleave', function (evt) {
                //el.setAttribute('line', "color: yellow; opacity: 0.3");
                console.log('leave'); //, $(el).find('*'));
                $parent.find('[gray]').attr('color', 'gray');
            });
        }
    });

    var move = false;
    
    AFRAME.registerComponent('keyboard-controls', {
        init: function () {
            var el = this.el;
            
            
            var keydown = function() {
                move = true;
            }
            
            var keyup = function() {
                move = false;
            }
            
    window.addEventListener('keydown', keydown, false);
    window.addEventListener('keyup', keyup, false);

        },
        tick: function() {
            if (move) {
                var $camera = $(this.el);
                var pos = $camera.find('.keyboard-helper')[0].object3D.getWorldPosition();
                cameraDiff = {x: pos.x, y: 0, z: pos.z};
            }
        }
    });    
    
    AFRAME.registerComponent('anim-listener', {
        init: function () {
            var el = this.el;

            el.addEventListener('animationend', function (evt) {
                if ($(evt.target).hasClass("anim2")) {
                    el.emit('jump2');
                }
                if ($(evt.target).hasClass("spawn")) {
                    $(evt.target).parent().find('.touchsound')[0].components.sound.playSound();
                    $(el).find('> a-entity')[0].emit('jump');
                    $(el).find('.machine')[0].emit('jump');
                }
                if ($(evt.target).hasClass("jump2") && $(el).hasClass('machine')) {
                    console.log('jumped');
                    setTimeout(function() {
                        var $arcade = $(el).parent().parent().parent();
                        var pos = $arcade.find('.anim-position')[0].object3D.getWorldPosition();
                        $arcade.find('.anim-position')[0].setAttribute('position', '0 0 0');
                        $arcade[0].setAttribute('position', pos);
                        
                        
/*                        var pos = $(el).parent().parent().parent()[0].getAttribute('position');
                        var rot = $(el).parent().parent().parent()[0].getAttribute('rotation');
                        console.log(rot);
                        pos = new THREE.Vector3(pos.x, pos.y, pos.z);
                        rot = new THREE.Vector3(rot.x, rot.y, rot.z);
                        var vec = new THREE.Vector3(0, 0, -1);
                        vec = vec.applyAxisAngle(new THREE.Vector3(1,0,0), rot.x);
                        vec = vec.applyAxisAngle(new THREE.Vector3(0,1,0), rot.y);
                        vec = vec.applyAxisAngle(new THREE.Vector3(0,0,1), rot.z);
                        $(el).parent().parent().parent()[0].setAttribute('position', pos.add(vec));
                        $(el).parent().parent().parent().find('.anim-position')[0].setAttribute('position', '0 0 0');

//                        $(el).parent()
  */                      
                        $(el).parent()[0].emit('jump');
                        el.emit('jump');
                    }, 1000);
                }
            });
        }
    });
    
    AFRAME.registerComponent('coin-listener', {
        init: function () {
            var el = this.el;
            var $parent = $(el).parent().parent();

            el.addEventListener('mouseenter', function (evt) {
                console.log('enter');
                el.setAttribute('color', 'yellow');
                $(el).find('.c')[0].setAttribute('visible', 'true');
            });
    
            el.addEventListener('mousedown', function (evt) {
                console.log('start');
                if (!gameHasStarted) {
                    $parent[0].setAttribute('position', "0 0 -0.5");
                    $parent.find('.explosion')[0].setAttribute('visible', 'true');
                    $parent.find('.explosion .sound')[0].components.sound.playSound();
                    $parent.find('.machine')[0].setAttribute('visible', 'false');
                    console.log( $parent.find('.wand')[0]);
                    gameHasStarted = true;
                    gameHasSetup = false;
                    window.gameStarted = true;
                    $('#music')[0].components.sound.playSound();
                    setTimeout(function() { $parent.find('.explosion')[0].setAttribute('visible', 'false'); }, 1000);
            

/*
                    $(el).parent().parent()[0].emit('move');
                    $(el).parent()[0].emit('jump');
            */
                }

                
            });
    
            el.addEventListener('mouseleave', function (evt) {
                //el.setAttribute('line', "color: yellow; opacity: 0.3");
                console.log('leave'); //, $(el).find('*'));
                el.setAttribute('color', '');
                $(el).find('.c')[0].setAttribute('visible', 'false');
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
            //$('#camera')[0].setAttribute('wasd-controls', '');
            $('#camera')[0].setAttribute('keyboard-controls', '');
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
                if (shakeCount > 32) {
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
                    if (cameraDiff.x > 25) {
                        cameraDiff.x = 25;
                    }
                    if (cameraDiff.x < -25) {
                        cameraDiff.x = -25;
                    }
                    if (cameraDiff.z > 25) {
                        cameraDiff.z = 25;
                    }
                    if (cameraDiff.z < -25) {
                        cameraDiff.z = -25;
                    }
                }
                // speech enabled
                    
                
                if (gameHasStarted) {
                    if (!gameHasSetup) {
                        gameHasSetup = true;
                        function spawn() {
                            var clone = $('#arcade-template').clone();
                            clone.attr('id', '');
                            clone.attr('position', (Math.random()*48-24) + ' 0 ' + (Math.random()*48-24));
                            clone.attr('rotation', '0 ' + Math.random()*360 + ' 0').attr('visible','true');
                            clone.find('.wand').attr('visible', 'true');
                            clone.find('.explosion').attr('visible', 'false');
                            clone.find('.explosion .sound').attr('src', 'url(explosions/'+Math.ceil(Math.random()*5)+'.ogg)');
                            clone.find('.bounding').addClass('clickable').attr('mouse-listener', '');
                            clone.find('> a-entity').attr('position', '0 100 0');
                            clone.appendTo($('a-scene'));
                            setTimeout(function() {
                                clone.find('> a-entity')[0].emit('spawn');
                            }, 0);
                        }
                        spawn();
                        setInterval(spawn, 5000);
                    }
                }  
            }
            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
    }
    
    window.sceneApp = sceneApp;

})();
