/*!
 * *//* eslint-disable */
/*!
 * react-interactable v0.6.5
 * (c) 2019-present Javier Marquez
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react'), require('prop-types'), require('animated/lib/targets/react-dom'), require('react-panresponder-web')) :
  typeof define === 'function' && define.amd ? define(['react', 'prop-types', 'animated/lib/targets/react-dom', 'react-panresponder-web'], factory) :
  (global.Interactable = factory(global.React,global.PropTypes,global.Animated,global.PanResponder));
}(this, (function (React,PropTypes,Animated,PanResponder) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;
  PropTypes = PropTypes && PropTypes.hasOwnProperty('default') ? PropTypes['default'] : PropTypes;
  Animated = Animated && Animated.hasOwnProperty('default') ? Animated['default'] : Animated;
  PanResponder = PanResponder && PanResponder.hasOwnProperty('default') ? PanResponder['default'] : PanResponder;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var Utils = {
    createArea: function createArea(boundaries) {
      return {
        minPoint: {
          x: boundaries.left === undefined ? -Infinity : boundaries.left,
          y: boundaries.top === undefined ? -Infinity : boundaries.top
        },
        maxPoint: {
          x: boundaries.right === undefined ? Infinity : boundaries.right,
          y: boundaries.bottom === undefined ? Infinity : boundaries.bottom
        }
      };
    },
    createAreaFromRadius: function createAreaFromRadius(radius, anchor) {
      return {
        minPoint: {
          x: anchor.x - radius,
          y: anchor.y - radius
        },
        maxPoint: {
          x: anchor.x + radius,
          y: anchor.y + radius
        }
      };
    },
    isPointInArea: function isPointInArea(_ref, area) {
      var x = _ref.x,
          y = _ref.y;
      if (!area) return true;
      var minPoint = area.minPoint,
          maxPoint = area.maxPoint;
      return x >= minPoint.x && x <= maxPoint.x && y >= minPoint.y && y <= maxPoint.y;
    },
    findClosest: function findClosest(origin, points) {
      var _this = this;

      var minDistance = Infinity;
      var closestPoint = null;
      points.forEach(function (point) {
        var distance = _this.getDistance(point, origin);

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }); // console.log( distances )

      return closestPoint;
    },
    getDistance: function getDistance(point, relative) {
      var p = {
        x: point.x === undefined ? Infinity : point.x,
        y: point.y === undefined ? Infinity : point.y
      };
      var r = {
        x: relative.x === undefined ? Infinity : relative.x,
        y: relative.y === undefined ? Infinity : relative.y
      };
      if (p.x === Infinity && p.y === Infinity) return Infinity;
      var dx = p.x === Infinity ? 0 : Math.abs(r.x - p.x);
      var dy = p.y === Infinity ? 0 : Math.abs(r.y - p.y);
      return Math.sqrt(dx * dx + dy * dy);
    },
    getDelta: function getDelta(point, origin) {
      return {
        x: point.x - origin.x,
        y: point.y - origin.y
      };
    }
  };

  function def(value, defaultValue) {
    return value === undefined ? defaultValue : value;
  }

  var Behaviors = {
    anchor: {
      create: function create(options) {
        var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return {
          x0: options.x,
          y0: options.y,
          priority: 1,
          isTemp: isTemp,
          type: 'anchor'
        };
      },
      doFrame: function doFrame(options, deltaTime, state, coords) {
        // Velocity = dx / deltaTime
        state.vx = (options.x0 - coords.x) / deltaTime;
        state.vy = (options.y0 - coords.y) / deltaTime;
      }
    },
    bounce: {
      create: function create(options) {
        var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return {
          type: 'bounce',
          bounce: def(options.bounce, .5),
          minPoint: options.influence.minPoint,
          maxPoint: options.influence.maxPoint,
          priority: 3,
          isTemp: isTemp
        };
      },
      doFrame: function doFrame(_ref, deltaTime, state, _ref2, target) {
        var minPoint = _ref.minPoint,
            maxPoint = _ref.maxPoint,
            bounce = _ref.bounce;
        var x = _ref2.x,
            y = _ref2.y;
        // Apply limits
        if (minPoint.x > x) target.setTranslationX(minPoint.x);
        if (minPoint.y > y) target.setTranslationY(minPoint.y);
        if (maxPoint.x < x) target.setTranslationX(maxPoint.x);
        if (maxPoint.y < y) target.setTranslationY(maxPoint.y);
        var vx = state.vx,
            vy = state.vy;

        if (minPoint.x > x && vx < 0) {
          state.vx = -vx * bounce;
        }

        if (minPoint.y > y && vy < 0) {
          state.vy = -vy * bounce;
        }

        if (maxPoint.x < x && vx > 0) {
          state.vx = -vx * bounce;
        }

        if (maxPoint.y < y && vy > 0) {
          state.vy = -vy * bounce;
        }
      }
    },
    friction: {
      create: function create(options) {
        var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return {
          type: 'friction',
          damping: def(options.damping, .7),
          influence: Utils.createArea(options.influenceArea || {}),
          priority: 2,
          isTemp: isTemp
        };
      },
      doFrame: function doFrame(options, deltaTime, state, coords) {
        if (!Utils.isPointInArea(coords, options.influence)) return;
        var pow = Math.pow(options.damping, 60.0 * deltaTime);
        state.vx = pow * state.vx;
        state.vy = pow * state.vy;
      }
    },
    gravity: {
      create: function create(options) {
        var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return {
          type: 'gravity',
          x0: def(options.x, Infinity),
          y0: def(options.y, Infinity),
          strength: def(options.strength, 400),
          falloff: def(options.falloff, 40),
          damping: def(options.damping, 0),
          influence: Utils.createArea(options.influenceArea || {}),
          isTemp: isTemp,
          priority: 1
        };
      },
      doFrame: function doFrame(options, deltaTime, state, coords) {
        if (!Utils.isPointInArea(coords, options.influence)) return;
        var dx = options.x0 !== Infinity ? coords.x - options.x0 : 0;
        var dy = options.y0 !== Infinity ? coords.y - options.y0 : 0;
        var dr = Math.sqrt(dx * dx + dy * dy);
        if (!dr) return;
        var falloff = options.falloff,
            strength = options.strength;
        var a = -strength * dr * Math.exp(-0.5 * (dr * dr) / (falloff * falloff)) / state.mass;
        var ax = dx / dr * a;
        var ay = dy / dr * a;
        state.vx += deltaTime * ax;
        state.vy += deltaTime * ay;
      }
    },
    spring: {
      create: function create(options) {
        var isTemp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        return {
          type: 'spring',
          x0: def(options.x, 0),
          y0: def(options.y, 0),
          tension: def(options.tension, 300),
          influence: Utils.createArea(options.influenceArea || {}),
          isTemp: isTemp,
          priority: 1
        };
      },
      doFrame: function doFrame(options, deltaTime, state, coords) {
        if (!Utils.isPointInArea(coords, options.influence)) return;
        var dx = coords.x - options.x0;

        if (dx) {
          // time * acceleration
          state.vx += deltaTime * (-1 * options.tension * dx / state.mass);
        }

        var dy = coords.y - options.y0;

        if (dy) {
          // time * acceleration
          state.vy += deltaTime * (-1 * options.tension * dy / state.mass);
        }
      }
    }
  };

  var ANIMATOR_PAUSE_CONSECUTIVE_FRAMES = 10;
  var ANIMATOR_PAUSE_ZERO_VELOCITY = 1.0;

  if (typeof requestAnimationFrame === 'undefined') {
    // We just don't work without raf (maybe we are in the server)
    // eslint-disable-next-line no-native-reassign
    requestAnimationFrame = function requestAnimationFrame() {};
  }

  var PhysicsAnimator =
  /*#__PURE__*/
  function () {
    function PhysicsAnimator(View, listener, debug) {
      _classCallCheck(this, PhysicsAnimator);

      _defineProperty(this, "behaviors", []);

      _defineProperty(this, "physicsObject", {
        vx: 0,
        vy: 0,
        mass: 1
      });

      _defineProperty(this, "consecutiveFramesWithNoMovement", 0);

      _defineProperty(this, "screenScale", 1);

      _defineProperty(this, "lastFrameTS", 0);

      _defineProperty(this, "isRunning", false);

      _defineProperty(this, "ticking", false);

      _defineProperty(this, "isDragging", false);

      this.View = View;
      this.animatorListener = listener;

      if (!debug) {
        var nofn = function nofn() {};

        this.debugStart = nofn;
        this.debugEnd = nofn;
      }
    }

    _createClass(PhysicsAnimator, [{
      key: "doFrame",
      value: function doFrame(frameTimeMillis) {
        var _this = this;

        if (!this.isRunning) return;

        if (this.lastFrameTS) {
          this.animateFrameWithDeltaTime((frameTimeMillis - this.lastFrameTS) * 1e-3);
        }

        this.lastFrameTS = frameTimeMillis;
        this.animatorListener.onAnimationFrame();
        requestAnimationFrame(function () {
          return _this.doFrame(Date.now());
        });
      }
    }, {
      key: "debugStart",
      value: function debugStart(behavior) {
        if (this.debug !== true && this.debug !== behavior.type) return;
        this.debugB = behavior;
        this.debugInitialV = Object.assign({}, this.physicsObject);
      }
    }, {
      key: "debugEnd",
      value: function debugEnd() {
        if (!this.debugB || this.debug !== true && this.debug !== this.debugB.type) return;
        console.log("Debug ".concat(this.debugB.type), {
          dvx: this.physicsObject.vx - this.debugInitialV.vx,
          dvy: this.physicsObject.vy - this.debugInitialV.vy
        });
      }
    }, {
      key: "animateFrameWithDeltaTime",
      value: function animateFrameWithDeltaTime(deltaTime) {
        var _this2 = this;

        if (!deltaTime) return;
        var physicsObject = this.physicsObject,
            behaviors = this.behaviors,
            View = this.View;
        var hadMovement = false;
        var coords = View.getTranslation();
        behaviors.forEach(function (behavior) {
          _this2.debugStart(behavior);

          Behaviors[behavior.type].doFrame(behavior, deltaTime, physicsObject, coords, View);

          _this2.debugEnd();
        });
        var dx = 0;
        var vx = physicsObject.vx,
            vy = physicsObject.vy;

        if (Math.abs(vx) > ANIMATOR_PAUSE_ZERO_VELOCITY) {
          dx = deltaTime * vx;
          hadMovement = true;
        }

        var dy = 0;

        if (Math.abs(vy) > ANIMATOR_PAUSE_ZERO_VELOCITY) {
          dy = deltaTime * vy;
          hadMovement = true;
        }

        View.animate(dx, dy);
        var cfwnm = hadMovement ? 0 : this.consecutiveFramesWithNoMovement + 1;
        this.consecutiveFramesWithNoMovement = cfwnm;

        if (cfwnm >= ANIMATOR_PAUSE_CONSECUTIVE_FRAMES && !this.isDragging) {
          this.stopRunning();
          this.animatorListener.onAnimatorPause();
        }
      }
    }, {
      key: "addBehavior",
      value: function addBehavior(type, options, isTemp) {
        var b = Behaviors[type];
        if (!b) return;
        var behavior = b.create(options, isTemp);
        var behaviors = this.behaviors;
        var idx = 0;

        while (behaviors.length > idx && behaviors[idx].priority <= behavior.priority) {
          ++idx;
        }

        behaviors.splice(idx, 0, behavior);
        this.ensureRunning();
        return behavior;
      }
    }, {
      key: "remove",
      value: function remove(condition) {
        var behaviors = this.behaviors;
        var i = behaviors.length;

        while (i-- > 0) {
          if (condition(behaviors[i])) {
            behaviors.splice(i, 1);
          }
        }
      }
    }, {
      key: "removeBehavior",
      value: function removeBehavior(behavior) {
        this.remove(function (target) {
          return target === behavior;
        });
      }
    }, {
      key: "removeTypeBehaviors",
      value: function removeTypeBehaviors(type) {
        this.remove(function (target) {
          return target.type === type;
        });
      }
    }, {
      key: "removeTempBehaviors",
      value: function removeTempBehaviors() {
        this.remove(function (target) {
          return target.isTemp;
        });
      }
    }, {
      key: "getVelocity",
      value: function getVelocity() {
        return {
          x: this.physicsObject.vx,
          y: this.physicsObject.vy
        };
      }
    }, {
      key: "ensureRunning",
      value: function ensureRunning() {
        this.isRunning || this.startRunning();
      }
    }, {
      key: "startRunning",
      value: function startRunning() {
        var _this3 = this;

        this.isRunning = true;
        this.lastFrameTS = 0;
        this.consecutiveFramesWithNoMovement = 0;
        requestAnimationFrame(function () {
          return _this3.doFrame(Date.now());
        });
      }
    }, {
      key: "stopRunning",
      value: function stopRunning() {
        this.removeTempBehaviors();
        this.physicsObject = {
          vx: 0,
          vy: 0,
          mass: this.physicsObject.mass
        };
        this.isRunning = false;
      }
    }]);

    return PhysicsAnimator;
  }();

  var propBehaviors = {
    frictionAreas: 'friction',
    gravityPoints: 'gravity',
    springPoints: 'spring'
  };
  var isWeb = typeof document !== 'undefined';
  function injectDependencies(Animated$$1, PanResponder$$1) {
    var _class, _temp;

    return _temp = _class =
    /*#__PURE__*/
    function (_Component) {
      _inherits(InteractableView, _Component);

      function InteractableView(props) {
        var _this;

        _classCallCheck(this, InteractableView);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(InteractableView).call(this, props));

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "initialPositionSet", false);

        _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "isDragging", false);

        var _props$initialPositio = props.initialPosition,
            _props$initialPositio2 = _props$initialPositio.x,
            x = _props$initialPositio2 === void 0 ? 0 : _props$initialPositio2,
            _props$initialPositio3 = _props$initialPositio.y,
            y = _props$initialPositio3 === void 0 ? 0 : _props$initialPositio3; // In case animatedValueXY is not given

        _this.animated = new Animated$$1.ValueXY({
          x: x,
          y: y
        }); // This guy will apply all the physics

        _this.animator = _this.createAnimator(props); // Cache when the view is inside of an alert area

        _this.insideAlertAreas = {}; // cache calculated areas

        _this.propAreas = {
          alert: [],
          boundaries: false
        };
        _this._pr = _this.createPanResponder(props); // Set behaviors and prop defaults

        _this.setPropBehaviours({}, props); // Set initial position


        var animated = _this.getAnimated(props);

        animated.x.setValue(x);
        animated.y.setValue(y);
        animated.x._startingValue = x;
        animated.y._startingValue = y; // Save the last animation end position to report good coordinates in the events

        _this.lastEnd = Object.assign({}, _this.initialPosition);
        return _this;
      }

      _createClass(InteractableView, [{
        key: "render",
        value: function render() {
          var _this$getAnimated = this.getAnimated(),
              x = _this$getAnimated.x,
              y = _this$getAnimated.y;

          var style = this.props.style;
          var withPosition = Object.assign({
            transform: [{
              translateX: x
            }, {
              translateY: y
            }].concat(style.transform || [])
          }, style);
          var panHandlers = this.props.dragEnabled ? this._pr.panHandlers : {};
          return React__default.createElement(Animated$$1.View, _extends({
            style: withPosition
          }, panHandlers), this.props.children);
        }
      }, {
        key: "getTranslation",
        value: function getTranslation() {
          var _this$getAnimated2 = this.getAnimated(),
              x = _this$getAnimated2.x,
              y = _this$getAnimated2.y;

          return {
            x: x._value + x._offset,
            y: y._value + y._offset
          };
        }
      }, {
        key: "setTranslationX",
        value: function setTranslationX(tx) {
          var animated = this.props.animatedValueX || this.animated.x;
          animated.setValue(tx - animated._offset);
        }
      }, {
        key: "setTranslationY",
        value: function setTranslationY(ty) {
          var animated = this.props.animatedValueY || this.animated.y;
          animated.setValue(ty - animated._offset);
        }
      }, {
        key: "setTranslation",
        value: function setTranslation(tx, ty) {
          this.setTranslationX(tx);
          this.setTranslationY(ty);
        }
      }, {
        key: "createAnimator",
        value: function createAnimator() {
          var _this2 = this;

          return new PhysicsAnimator(this, {
            onAnimatorPause: function onAnimatorPause() {
              var _this2$getTranslation = _this2.getTranslation(),
                  x = _this2$getTranslation.x,
                  y = _this2$getTranslation.y;

              _this2.lastEnd = {
                x: Math.round(x),
                y: Math.round(y)
              };

              _this2.props.onStop(_this2.lastEnd);
            },
            onAnimationFrame: function onAnimationFrame() {
              _this2.reportAlertEvent(_this2.getTranslation());
            }
          }, false // Set true or behavior type to output debug info in the console
          );
        }
      }, {
        key: "animate",
        value: function animate(dx, dy) {
          if (!dx && !dy) return; // let animated = this.getAnimated()
          // console.log( dx + animated.x._value + animated.x._offset )

          var _this$getTranslation = this.getTranslation(),
              x = _this$getTranslation.x,
              y = _this$getTranslation.y;

          this.setTranslation(x + dx, y + dy);
        }
      }, {
        key: "getAnimated",
        value: function getAnimated(props) {
          var _ref = props || this.props,
              animatedValueX = _ref.animatedValueX,
              animatedValueY = _ref.animatedValueY;

          return {
            x: animatedValueX || this.animated.x,
            y: animatedValueY || this.animated.y
          };
        }
      }, {
        key: "createPanResponder",
        value: function createPanResponder() {
          var _this3 = this;

          var capturer = this.checkResponderCapture.bind(this);
          return PanResponder$$1.create({
            onMoveShouldSetResponderCapture: capturer,
            onMoveShouldSetPanResponderCapture: capturer,
            onPanResponderGrant: function onPanResponderGrant(e, _ref2) {
              var x0 = _ref2.x0,
                  y0 = _ref2.y0;
              _this3._captured = true;

              _this3.startDrag({
                x: x0,
                y: y0
              });
            },
            onPanResponderMove: function onPanResponderMove(e, gesture) {
              _this3.onDragging(gesture);
            },
            onPanResponderRelease: function onPanResponderRelease() {
              _this3._captured = false;

              _this3.endDrag();
            }
          });
        }
      }, {
        key: "checkResponderCapture",
        value: function checkResponderCapture(e, gesture) {
          return this._captured || Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
        }
      }, {
        key: "reportAlertEvent",
        value: function reportAlertEvent(position) {
          var inside = this.insideAlertAreas;
          var onAlert = this.props.onAlert;
          this.propAreas.alert.forEach(function (_ref3) {
            var influence = _ref3.influence,
                id = _ref3.id;
            if (!influence || !id) return;

            if (Utils.isPointInArea(position, influence)) {
              if (!inside[id]) {
                onAlert({
                  id: id,
                  value: "enter"
                });
                inside[id] = 1;
              }
            } else if (inside[id]) {
              onAlert({
                id: id,
                value: "leave"
              });
              inside[id] = 0;
            }
          });
        }
      }, {
        key: "startDrag",
        value: function startDrag(ev) {
          // Prepare the animated
          var _this$getAnimated3 = this.getAnimated(),
              x = _this$getAnimated3.x,
              y = _this$getAnimated3.y;

          var offset = {
            x: x._value,
            y: y._value
          };
          x.setOffset(offset.x);
          y.setOffset(offset.y);
          x.setValue(0);
          y.setValue(0); // Save the offset for triggering events with the right coordinates

          this.lastEnd = offset; // console.log( offset )
          // Set boundaries to fast access

          this.dragBoundaries = this.propAreas.boundaries ? this.propAreas.boundaries.influence : {}; // Prepare the animation

          this.props.onDrag({
            state: 'start',
            x: offset.x,
            y: offset.y
          });
          this.dragStartLocation = {
            x: ev.x,
            y: ev.y
          };
          this.animator.removeTempBehaviors();
          this.animator.isDragging = true;
          this.animator.vx = 0;
          this.animator.vy = 0;
          this.addTempDragBehavior(this.props.dragWithSpring); // Stop text selection

          if (isWeb) {
            var styles = document.body.style;
            this.userSelectCache = styles.userSelect;
            styles.userSelect = "none";
          }
        }
      }, {
        key: "onDragging",
        value: function onDragging(_ref4) {
          var dx = _ref4.dx,
              dy = _ref4.dy;
          if (!this.animator.isDragging) return false;
          if (!this.props.dragEnabled) return this.endDrag();
          var pos = this.lastEnd;
          var x = dx + pos.x;
          var y = dy + pos.y; // console.log( this.dragBoundaries.minPoint )

          var _this$dragBoundaries = this.dragBoundaries,
              minPoint = _this$dragBoundaries.minPoint,
              maxPoint = _this$dragBoundaries.maxPoint;

          if (!this.props.verticalOnly) {
            if (minPoint) {
              if (minPoint.x > x) x = minPoint.x;
              if (maxPoint.x < x) x = maxPoint.x;
            }

            this.dragBehavior.x0 = x;
          }

          if (!this.props.horizontalOnly) {
            if (minPoint) {
              if (minPoint.y > y) y = minPoint.y;
              if (maxPoint.y < y) y = maxPoint.y;
            }

            this.dragBehavior.y0 = y;
          } // console.log( this.dragBehavior )

        }
      }, {
        key: "endDrag",
        value: function endDrag() {
          this.animator.removeTempBehaviors();
          this.dragBehavior = null;
          this.animator.isDragging = false;
          var animator = this.animator,
              horizontalOnly = this.horizontalOnly,
              verticalOnly = this.verticalOnly,
              dragWithSprings = this.dragWithSprings;
          var velocity = animator.getVelocity();
          if (horizontalOnly) velocity.y = 0;
          if (verticalOnly) velocity.x = 0;
          var toss = dragWithSprings && dragWithSprings.toss || this.props.dragToss;

          var _this$getTranslation2 = this.getTranslation(),
              x = _this$getTranslation2.x,
              y = _this$getTranslation2.y;

          var projectedCenter = {
            x: x + toss * velocity.x,
            y: y + toss * velocity.y
          }; // console.log( 'pc', projectedCenter, velocity)

          var snapPoint = Utils.findClosest(projectedCenter, this.props.snapPoints);
          var targetSnapPointId = snapPoint && snapPoint.id || "";
          this.props.onDrag({
            state: 'end',
            x: x,
            y: y,
            targetSnapPointId: targetSnapPointId
          });
          this.addTempSnapToPointBehavior(snapPoint);
          this.addTempBoundaries();
          var animated = this.getAnimated();
          animated.x.flattenOffset();
          animated.y.flattenOffset(); // Restore text selection

          if (isWeb) {
            document.body.userSelect = this.userSelectCache || '';
          }
        }
      }, {
        key: "addTempDragBehavior",
        value: function addTempDragBehavior(drag) {
          var pos = this.getTranslation();

          if (!drag || drag.tension === Infinity) {
            this.dragBehavior = this.animator.addBehavior('anchor', pos, true);
          } else {
            pos.tension = drag.tension || 300;
            this.dragBehavior = this.animator.addBehavior('spring', pos, true);

            if (drag.damping) {
              this.animator.addBehavior('friction', drag, true);
            }
          }
        }
      }, {
        key: "addTempSnapToPointBehavior",
        value: function addTempSnapToPointBehavior(snapPoint) {
          if (!snapPoint) return;
          var _this$props = this.props,
              snapPoints = _this$props.snapPoints,
              onSnap = _this$props.onSnap,
              onSnapStart = _this$props.onSnapStart;
          var index = snapPoints.indexOf(snapPoint);
          onSnap({
            index: index,
            id: snapPoint.id
          });
          onSnapStart({
            index: index,
            id: snapPoint.id
          });
          var springOptions = Object.assign({
            damping: .7,
            tension: 300
          }, snapPoint);
          this.addBehavior('spring', springOptions, true);
        }
      }, {
        key: "setVelocity",
        value: function setVelocity(velocity) {
          if (this.dragBehavior) return;
          this.animator.physicsObject.vx = velocity.x;
          this.animator.physicsObject.vy = velocity.y;
          this.endDrag();
        }
      }, {
        key: "snapTo",
        value: function snapTo(_ref5) {
          var index = _ref5.index;
          var snapPoints = this.props.snapPoints;
          if (!snapPoints || index === undefined || index >= snapPoints.length) return;
          this.animator.removeTempBehaviors();
          this.dragBehavior = null;
          var snapPoint = snapPoints[index];
          this.addTempSnapToPointBehavior(snapPoint);
          this.addTempBoundaries();
        }
      }, {
        key: "addTempBoundaries",
        value: function addTempBoundaries() {
          var boundaries = this.propAreas.boundaries;
          if (!boundaries) return;
          this.animator.addBehavior('bounce', boundaries, true);
        }
      }, {
        key: "changePosition",
        value: function changePosition(position) {
          if (this.dragBehavior) return;
          this.setTranslation(position.x, position.y);
          this.endDrag();
        }
      }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate(prevProps) {
          this.setPropBehaviours(prevProps, this.props);
        }
      }, {
        key: "setPropBehaviours",
        value: function setPropBehaviours(prevProps, props) {
          var _this4 = this;

          // spring, gravity, friction
          Object.keys(propBehaviors).forEach(function (prop) {
            if (prevProps[prop] !== props[prop]) {
              _this4.animator.removeTypeBehaviors(propBehaviors[prop]);

              _this4.addTypeBehaviors(propBehaviors[prop], props[prop]);
            }
          });

          if (prevProps.alertAreas !== props.alertAreas) {
            var alertAreas = [];
            props.alertAreas.forEach(function (area) {
              alertAreas.push({
                id: area.id,
                influence: Utils.createArea(area.influenceArea)
              });
            });
            this.propAreas.alert = alertAreas;
          }

          if (prevProps.boundaries !== props.boundaries) {
            this.animator.removeBehavior(this.oldBoundariesBehavior);

            if (props.boundaries) {
              var bounce = {
                bounce: props.boundaries.bounce || 0,
                influence: Utils.createArea(props.boundaries)
              };
              this.propAreas.boundaries = bounce;
              this.oldBoundariesBehavior = this.animator.addBehavior('bounce', bounce);
            } else {
              this.propAreas.boundaries = false;
            }
          }

          if (!this.props.dragEnabled && prevProps.dragEnabled && this.dragBehavior) {
            this.endDrag();
          }
        }
      }, {
        key: "addTypeBehaviors",
        value: function addTypeBehaviors(type, behaviors, isTemp) {
          var _this5 = this;

          behaviors.forEach(function (b) {
            return _this5.addBehavior(type, b, isTemp);
          });
        }
      }, {
        key: "addBehavior",
        value: function addBehavior(type, behavior, isTemp) {
          this.animator.addBehavior(type, behavior, isTemp);

          if (behavior.damping && type !== 'friction') {
            var b = this.animator.addBehavior('friction', behavior, isTemp);

            if (type === 'gravity' && !behavior.influenceArea) {
              b.influence = Utils.createAreaFromRadius(1.4 * (behavior.falloff || 40), behavior);
            }
          }
        }
      }]);

      return InteractableView;
    }(React.Component), _defineProperty(_class, "propTypes", {
      snapPoints: PropTypes.array,
      frictionAreas: PropTypes.array,
      alertAreas: PropTypes.array,
      gravityPoints: PropTypes.array,
      horizontalOnly: PropTypes.bool,
      verticalOnly: PropTypes.bool,
      dragWithSpring: PropTypes.object,
      dragEnabled: PropTypes.bool,
      animatedValueX: PropTypes.instanceOf(Animated$$1.Value),
      animatedValueY: PropTypes.instanceOf(Animated$$1.Value),
      onSnap: PropTypes.func,
      onSnapStart: PropTypes.func,
      onEnd: PropTypes.func,
      onDrag: PropTypes.func,
      boundaries: PropTypes.object,
      initialPosition: PropTypes.object,
      dragToss: PropTypes.number
    }), _defineProperty(_class, "defaultProps", {
      snapPoints: [],
      frictionAreas: [],
      alertAreas: [],
      gravityPoints: [],
      boundaries: {},
      initialPosition: {
        x: 0,
        y: 0
      },
      dragToss: .1,
      dragEnabled: true,
      onSnap: function onSnap() {},
      onSnapStart: function onSnapStart() {},
      onStop: function onStop() {},
      onDrag: function onDrag() {},
      onAlert: function onAlert() {},
      style: {}
    }), _temp;
  }

  function AnimatedView(props) {
    var propStyles = props.style || {};
    var style = Object.assign({
      position: 'relative',
      display: 'flex'
    }, propStyles);
    return React__default.createElement(Animated.div, _extends({}, props, {
      style: style
    }), props.children);
  }

  Animated.View = AnimatedView;
  var Interactable = injectDependencies(Animated, PanResponder);
  var noNative = {
    View: Interactable
  };

  return noNative;

})));
//# sourceMappingURL=interactable.noNative.js.map
