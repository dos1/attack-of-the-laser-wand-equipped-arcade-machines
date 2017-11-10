(function() {

    const BOUNDARY = 24.5;
    
    window.gameStarted = false;
    
    var cameraPos = {x:0, y:0, z:0 };
    var cameraDiff = new THREE.Vector3(0,0,0);
    
    var gameHasStarted = false;

    AFRAME.registerComponent('trigger-listener', {
        init: function () {
            var el = this.el;
            //$('#dos')[0].setAttribute('visible', true);
            el.addEventListener('triggerdown', function (evt) {
                el.setAttribute('line', "color: red; opacity: 1");
                //console.log('down');
            });
            el.addEventListener('triggerup', function (evt) {
                el.setAttribute('line', "color: yellow; opacity: 0.3");
                //console.log('up'); //, $(el).find('*'));
            });
        }
    });

    AFRAME.registerComponent('yes-this-is-awful-code', {
        tick: function() {
            if (window.gameFrame) window.gameFrame(); 
            this.el.sceneEl.canvas.classList.remove('a-grab-cursor');
        }
    });
    
    AFRAME.registerComponent('mouse-listener', {
        init: function () {
            var el = this.el;
            var $parent = $(el).parent().parent();
            //$('#dos')[0].setAttribute('visible', true);
            el.addEventListener('mouseenter', function (evt) {
                // el.setAttribute('line', "color: red; opacity: 1");
                //console.log('enter');
                $parent.find('[gray]').attr('color', 'silver');
            document.body.classList.add('a-pointing');
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
                //console.log('leave'); //, $(el).find('*'));
                $parent.find('[gray]').attr('color', 'gray');
            document.body.classList.remove('a-pointing');
            });
        }
    });

    var move = false, turnleft = false, turnright = false;
    
    AFRAME.registerComponent('keyboard-controls', {
        init: function () {
            var el = this.el;
            var component = this;
            component.move = false;
            component.turnleft = false;
            component.turnright = false;
            component.mouseX = 0;
            component.mouseY = 0;
            
/*
down w 87
down s 83
down a 65
down d 68
down ArrowUp 38
down ArrowDown 40
down ArrowLeft 37
down ArrowRight 39
*/            
            var keydown = function(ev) {
                //console.log('down', ev.key, ev.keyCode);
                if ((ev.key == 'w') || (ev.keyCode == 87) || (ev.key == 'ArrowUp') || (ev.keyCode == 38) || (ev.key == ' ') || (ev.keyCode == 32)) {
                    component.move = true;
                }
                if ((ev.key == 'a') || (ev.keyCode == 65) || (ev.key == 'ArrowLeft') || (ev.keyCode == 37)) {
                    component.turnleft = true;
                }
                if ((ev.key == 'd') || (ev.keyCode == 68) || (ev.key == 'ArrowRight') || (ev.keyCode == 39)) {
                    component.turnright = true;
                }
            }
            
            var keyup = function(ev) {
                if ((ev.key == 'w') || (ev.keyCode == 87) || (ev.key == 'ArrowUp') || (ev.keyCode == 38) || (ev.key == ' ') || (ev.keyCode == 32))                      {
                    component.move = false;
                }
                if ((ev.key == 'a') || (ev.keyCode == 65) || (ev.key == 'ArrowLeft') || (ev.keyCode == 37)) {
                    component.turnleft = false;
                }
                if ((ev.key == 'd') || (ev.keyCode == 68) || (ev.key == 'ArrowRight') || (ev.keyCode == 39)) {
                    component.turnright = false;
                }
            }
            
            var mousemove = function(ev) {
                component.mouseX = ev.clientX;
                component.mouseY = ev.clientY;
            }
            
    window.addEventListener('keydown', keydown, false);
    window.addEventListener('keyup', keyup, false);
    window.addEventListener('mousemove', mousemove, false);

        },
        tick: function(time, timedelta) {
            var component = this;
            if (component.move) {
                var $camera = $(this.el);
                var obj = $camera.find('.keyboard-helper')[0].object3D;
                obj.position.z = -timedelta / 250;
                var pos = obj.getWorldPosition();
                cameraDiff = {x: pos.x, y: 0, z: pos.z};
                
                                if (vr) {
                    if (cameraDiff.x > BOUNDARY) {
                        cameraDiff.x = BOUNDARY;
                    }
                    if (cameraDiff.x < -BOUNDARY) {
                        cameraDiff.x = -BOUNDARY;
                    }
                    if (cameraDiff.z > BOUNDARY) {
                        cameraDiff.z = BOUNDARY;
                    }
                    if (cameraDiff.z < -BOUNDARY) {
                        cameraDiff.z = -BOUNDARY;
                    }
                    $('.position').attr('position', cameraDiff.x + ' ' + cameraDiff.y + ' ' + cameraDiff.z);
                }

            }
            if (component.turnleft) {
                //var $camera = $(this.el);
                
                var rot = $('.rotation')[0].getAttribute('rotation');
                rot = new THREE.Vector3(rot.x, rot.y, rot.z);
                rot = rot.add(new THREE.Vector3(0, timedelta / 10, 0));
                $('.rotation')[0].setAttribute('rotation', rot);
            }
            if (component.turnright) {
                //var $camera = $(this.el);
                
                var rot = $('.rotation')[0].getAttribute('rotation');
                rot = new THREE.Vector3(rot.x, rot.y, rot.z);
                rot = rot.add(new THREE.Vector3(0, -timedelta / 10, 0));
                $('.rotation')[0].setAttribute('rotation', rot);
            }
            
            $('#camera')[0].components.cursor.onMouseMove({type:'mousemove', clientX: component.mouseX, clientY: component.mouseY});
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
                if ($(evt.target).hasClass("jump") && $(el).hasClass('anim-position')) {
                    $(el).parent().find('.touchsound')[0].components.sound.playSound();
                }    
                if ($(evt.target).hasClass("jump2") && $(el).hasClass('machine')) {
                    //console.log('jumped');
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
                //console.log('enter');
                el.setAttribute('color', 'yellow');
                $(el).find('.c')[0].setAttribute('visible', 'true');
            document.body.classList.add('a-pointing');
            });
    
            el.addEventListener('mousedown', function (evt) {
                //console.log('start');
                if (!gameHasStarted) {
                    $parent[0].setAttribute('position', "0 0 -0.5");
                    $parent.find('.explosion')[0].setAttribute('visible', 'true');
                    $parent.find('.explosion .sound')[0].components.sound.playSound();
                    $parent.find('.machine')[0].setAttribute('visible', 'false');
                    //console.log( $parent.find('.wand')[0]);
                    gameHasStarted = true;
                    window.gameStarted = true;
                    $('#music')[0].components.sound.playSound();
                    setTimeout(function() { $parent.find('.explosion')[0].setAttribute('visible', 'false'); }, 1000);
            
                    
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

                    

/*
                    $(el).parent().parent()[0].emit('move');
                    $(el).parent()[0].emit('jump');
            */
                }

                
            });
    
            el.addEventListener('mouseleave', function (evt) {
                //el.setAttribute('line', "color: yellow; opacity: 0.3");
                //console.log('leave'); //, $(el).find('*'));
                el.setAttribute('color', '');
                $(el).find('.c')[0].setAttribute('visible', 'false');
            document.body.classList.remove('a-pointing');
            });
        }
    });


    AFRAME.registerComponent("camera-listener", {
        schema: {},
        tick: function() {
            if (move) return;
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
            
                            if (vr) {
                    if (cameraDiff.x > BOUNDARY) {
                        cameraDiff.x = BOUNDARY;
                    }
                    if (cameraDiff.x < -BOUNDARY) {
                        cameraDiff.x = -BOUNDARY;
                    }
                    if (cameraDiff.z > BOUNDARY) {
                        cameraDiff.z = BOUNDARY;
                    }
                    if (cameraDiff.z < -BOUNDARY) {
                        cameraDiff.z = -BOUNDARY;
                    }
                    $('.position').attr('position', cameraDiff.x + ' ' + cameraDiff.y + ' ' + cameraDiff.z);
                }

        }
    });
	
    var vr=false;

    $(function() {

        document.querySelector('a-scene').addEventListener('enter-vr', function () {
            vr=true;
        $('.position').attr('position', '0 0 0');
        $('.position').attr('rotation', '0 0 0');
//                    $('.screenshake').attr('position', '0 0 0');
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

    var lastshake = 0;

    function sceneApp() {

        var shake;

        function screenShake() {
            var shakeCount = 0;
            shake = setInterval(function() {
                //if (!vr) {
                    $('.screenshake').attr('position', Math.random()/8.0 + ' ' + Math.random()/8.0 + ' ' + Math.random()/8.0);
                //}
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
                if (!vr) {
                    $('.position').attr('rotation', Math.max(0, (val>0.0001) ? Math.sqrt(val,2) : 0 ) * 90 +' 0 0');
                }

                if (t-start >= 3200) {
//                    setTimeout(function() {
                        window.startLogo();
  //                  }, 200);
                                        
                    
                    touched = true;
                }
            } 
                
            if (t-start >= 3000) {                    
                if (t-start <= 3800) {
                    if (t-lastshake > 50) {
                        $('.screenshake').attr('position', Math.random()/8.0 + ' ' + Math.random()/8.0 + ' ' + Math.random()/8.0);
                        lastshake = t;
                    }
                } else {
                    $('.screenshake').attr('position', '0 0 0');
                }
            

                
                if (!speechEnabled) {
                    var time = (t-start)/1000 - 3;
                
                    if (!vr) {
                        $('.position').attr('position', '0 0 -' + Math.min(1, Math.pow(time/3, 2))*0.8);
                    }
                    
                    if (t-start >= 9000) {
                       
                        
                        speechEnabled = true;
                    }
                } 
            //    console.log(cameraDiff);
/*                if (vr) {
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
                    $('.position').attr('position', cameraDiff.x + ' ' + cameraDiff.y + ' ' + cameraDiff.z);
                }*/
                // speech enabled
                    
                
            }
            //window.requestAnimationFrame(frame);
        }

        window.gameFrame = frame;
        //window.requestAnimationFrame(frame);
    }
    
    window.sceneApp = sceneApp;

})();
