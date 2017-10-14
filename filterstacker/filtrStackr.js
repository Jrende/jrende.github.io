angular.module('filtrstackr.services', []);

/* Services */
angular.module('filtrstackr.services')
.factory('Defaults', ["Types", function(types) {
  var list = {
    "gauss": {

    },
    "clouds": {
      "seed": parseInt(Math.random() * 100000)
    },
    "flat": {

    },
    "noise": {

    },
    "blur": {

    },
    "undefined": {

    },
    "example": {
      "invert": false,
      "distortion": 10,
      "smoothness": 1,
      "scaling": 100
    }
    }
    return {
      //Should probably work.
      getDefaults: function(filter){
	if(filter !== undefined) {
	  _.each(filter.type.parameters, function(par, i, li) {
	    if(list[filter.type.id] === undefined || list[filter.type.id][par] === undefined) {
	      //What if it isn't a number!?
	      filter[par] = 1.0;
	    } else {
	      filter[par] = list[filter.type.id][par];
	    }
	  });
	  filter.alpha = 1.0;
	  filter.blendMode = types.getBlendModeById('normal');
	}
      }
    }
}]);


/* Services */
angular.module('filtrstackr.services').
factory('Filters', ["Types", function(types) {
  var currentIndex = 0;
  return {
    "list" : [ ],
    "add": function(item) {
      item.id = currentIndex++;
      this.list.push(item);
    },
    "remove": function(item){
      _.each(this.list, function(element, index, list) {
	if(element.id === item.id) {
	  list.splice(index, 1);
	}
      });
    },
    "setNewType": function(filter) {
    }
  }
}]);


angular.module('filtrstackr.services')
.factory('FilterItemVisibility', ["Filters", function(filters) {
  var visibility = [];
  return visibility;
}])
.factory('Renderer', ["Types", function(types) {
  var gl;
  var initCanvas = function() {
    var canvas = document.getElementById("glCanvas"); 
    try {
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch (e) {

    }
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }
  };
  var squareVertexPositionBuffer;
  var initBuffers = function() {
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
  1.0,  1.0, 0.0,
    -1.0,  1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0
      ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
  }
  var shaderPrograms = {};
  var createShaders = function(gl) {
    var shaderList = {};
    var req = new XMLHttpRequest();
    req.onload = function(e) {
      if(this.status === 200) {
	var shader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shader, this.responseText);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	  console.group(elm.id)
	    console.log(gl.getShaderInfoLog(shader))
	    console.groupEnd(elm.id)
	    return null;
	}
	shaderList["VertexShader"] = shader;
      }
    };
    req.open("GET", "shaders/VertexShader.glsl", false);
    req.setRequestHeader("Accept", "text/plain");
    req.send(null);

    _.each(types.list, function(elm, i, li) {
      var req = new XMLHttpRequest();
      req.onload = function(e) {
	if(this.status === 200) {
	  var shader = gl.createShader(gl.FRAGMENT_SHADER);
	  gl.shaderSource(shader, this.responseText);
	  gl.compileShader(shader);
	  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    console.group(elm.id)
	    console.log(gl.getShaderInfoLog(shader))
	    console.groupEnd(elm.id)
	    return null;
	  }
	  shaderList[elm.id] = shader;
	}
      };
      req.open("GET", "shaders/" + elm.id + ".glsl", false);
      req.setRequestHeader("Accept", "text/plain");
      req.send(null);
    });

    _.each(types.list, function(filterType, i, li) {
      var fragmentShader = shaderList[filterType.id]
      var vertexShader = shaderList["VertexShader"];
      if(fragmentShader === undefined || vertexShader === undefined) {
	return;
      }

      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	alert("Could not initialise shaders");
      }

      gl.useProgram(shaderProgram);

      shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

      shaderProgram.uniforms = {};
      for(var i = 0; i < filterType.parameters.length; i++) {
	shaderProgram.uniforms[filterType.parameters[i]] = gl.getUniformLocation(shaderProgram, filterType.parameters[i]);
      }
      shaderProgram.uniforms.tSampler = gl.getUniformLocation(shaderProgram, "tSampler");
      shaderProgram.uniforms.res = gl.getUniformLocation(shaderProgram, "res");

      gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

      shaderPrograms[filterType.id] = shaderProgram;
    });
  };
  var texFBO;
  var texture;
  var initTexture = function() {
    texFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, texFBO);
    texFBO.width = 512;
    texFBO.height = 512;

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texFBO.width, texFBO.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);


    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  var ready = false;	
  return {
    init: function() {
      initCanvas();
      initBuffers();
      initTexture();
      createShaders(gl);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.disable(gl.DEPTH_TEST);
      ready = true;
    },
      drawScene: function(filters) {
	if(ready) {
	  console.log("Drawing scene!");
	  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
	  gl.disable(gl.BLEND);
	  _.each(filters, function(filter, i, li) {
	    var shader = shaderPrograms[filter.type.id];
	    if(shader != null) {
	      gl.useProgram(shader);
	      gl.uniform2fv(shader.uniforms["res"], [gl.viewportWidth, gl.viewportHeight]);
	      for(var j = 0; j < filter.type.parameters.length; j++) {
		var parameter = filter.type.parameters[j];
		var argument = filter[parameter];
		if(parameter !== undefined && argument !== undefined) {
		  gl.uniform1f(shader.uniforms[parameter], argument);
		}
	      }
	      if(filter.blendMode !== undefined) {
		//Rita till skärmen, med det förra filtrstackrts textur
		gl.blendFunc(gl[filter.blendMode.srcFactor], gl[filter.blendMode.dstFactor]);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		gl.enable(gl.BLEND);
	      }
	    }
	  });
	}
      }
  };
}]);

angular.module('filtrstackr.services')
  .factory('Types', function() {
    return {
      "list": [
	{
	  "name": "Clouds",
	  "id": "clouds",
	  "parameters" : [
	    "alpha",
	    "blendMode",
	    "seed",
	    "size",
	    "depth",
	    "nabla",
	    "r",
	    "g",
	    "b"
	  ]
	},
	{
	  "name": "Flat color",
	  "id": "flat",
	  "parameters" : [
	    "alpha",
	    "blendMode",
	    "r",
	    "g",
	    "b"
	  ]
	},
	{
	  "name": "Noise",
	  "id": "noise",
	  "parameters" : [
	    "alpha",
	    "blendMode",
	    "amount"
	  ]
	},
	{
	  "name": "Plaid",
	  "id": "lines",
	  "parameters" : [
	    "alpha",
	    "blendMode",
	    "scale",
	    "r", "g", "b",
	    "x", "y"
	  ]
	},
	{
	  "name": "Undefined filter",
	  "id": "undefined",
	  "parameters" : []
	},
	{
	  "name": "Example",
	  "id": "example",
	  "parameters" : [
	    "alpha",
	    "blendMode",
	    "distortion",
	    "smoothness",
	    "scaling",
	    "invert"
	  ]
	}
      ], 
      "blendModes": [
	{
	  "name": "Normal",
	  "id": "normal",
	  "srcFactor": "SRC_ALPHA",
	  "dstFactor": "ONE_MINUS_SRC_ALPHA"

	},
	{
	  "name": "Multiply",
	  "id": "multiply",
	  "srcFactor": "DST_COLOR",
	  "dstFactor": "ONE_MINUS_SRC_ALPHA"
	},
	{
	  "name": "Screen",
	  "id": "screen",
	  "srcFactor": "SRC_ALPHA",
	  "dstFactor": "ONE_MINUS_SRC_COLOR"
	}
      ],
      "getTypeById": function(id) {
	for(var i = 0; i < this.list.length; i++) {
	  if(this.list[i].id === id) {
	    return this.list[i];
	  }
	}
	return null;
      },
      "getBlendModeById": function(id) {
	for(var i = 0; i < this.blendModes.length; i++) {
	  if(this.blendModes[i].id === id) {
	    return this.blendModes[i];
	  }
	}
	return null;
      },
      "setDefaults": function(filter) {
      },
      "getDefaults": function(filter) {
      }
    }
});

angular.module('filtrstackr.directives', []);

angular.module('filtrstackr.directives')
.directive('scene', ["Renderer", function(renderer) {
  return {
    restrict: "EA",
    replace: true,
    transclude: false,
    template: "<canvas id='glCanvas' width='800px' height='800px'></canvas>",
    compile: function compile(tElement, tAttrs, transclude) {
      return {
	pre: function preLink(scope, elm, iAttrs, controller) {
	},
	post: function postLink(scope, iElement, iAttrs, controller) {
		renderer.init();
	}
      }
    }
  }
}]);

angular.module('filtrstackr.directives')
.directive('input', ['Types', function(types) {
	return {
		restrict: "E",
		replace: false,
		transclude: false,
		require: 'ngModel',
		link: function(scope, iElement, iAttrs, controller) {
			if(iAttrs["type"] === "range") {
				controller.$parsers.push(function (input) {
					return parseFloat(input);
				});
			}
		}
	}
}])
//Changes ngModel twice, unneccesarily.
.directive('seed', [function() {
	return {
		restrict: "E",
		replace: true,
		transclude: false,
		require: 'ngModel',
		template: 
			'<fieldset class="seed">' +
				'<button class="seed-prev">&lt;</button>' +
				'<input type="text" ng-model="ngModel"></input>' +
				'<button class="seed-next">&gt;</button>' +
			'</fieldset>',
		scope: {
			ngModel: "="
		},
		link: function(scope, iElement, iAttrs, controller) {
			var generatedSeeds = [];
			var i = 0;
			iElement.find(".seed-prev").click(function(e) {
				i--;
				if(generatedSeeds[i] === undefined) {
					generatedSeeds[i] = parseInt(Math.random() * 100000);
				}
				scope.$apply(function() {
					scope.ngModel = generatedSeeds[i];
				});
			});
			iElement.find(".seed-next").click(function(e) {
				i++;
				if(generatedSeeds[i] === undefined) {
					generatedSeeds[i] = parseInt(Math.random() * 100000);
				}
				scope.$apply(function() {
					scope.ngModel = generatedSeeds[i];
				});
			});
			scope.$watch('ngModel', function() {
				generatedSeeds[i] = scope.ngModel;
			});
		}
	}
}])
.directive('toRgb', [function() {
  return {
    restrict: "A",
    replace: false,
    transclude: false,
    scope: {
	    toRgb: "=",
	    ngModel: "="
    },
    link: function(scope, iElement, iAttrs, controller) {
      scope.$watch("ngModel", function() {
	if(scope.ngModel !== undefined) {
	  var c = scope.ngModel.substring(1);
	  scope.toRgb.r = parseInt(c.substr(0,2), 16)/255.0;
	  scope.toRgb.g = parseInt(c.substr(2,2), 16)/255.0;
	  scope.toRgb.b = parseInt(c.substr(4,2), 16)/255.0;
	  window.test = iElement;
	}
      });
    }
  }
}]);


angular.module('filtrstackr.filterlist', []);

angular.module('filtrstackr.filterlist.directives', [])
.directive('fsFilterControl', ['Types', function(types) {
  return {
    restrict: "A",
    replace: false,
    transclude: false,
    scope: {
      fsFilterControl: "="
    },
    link: function(scope, iElement, iAttrs, controller) {
      scope.url = "partials/" + scope.fsFilterControl.type.id + ".html";
      scope.types = types.list;
      scope.blendModes = types.blendModes;
    },
    templateUrl: 'partials/filterControl.html'
  }
}])
.directive('sortable', ["Filters", function(filters) {
    return {
      restrict: 'EA',
      transclude: false,
      replace: true,
      scope: {
	fsModel: "="
      },
      compile: function compile(tElement, tAttrs, transclude) {
	return {
	  pre: function preLink(scope, elm, iAttrs, controller) {
	    var list = elm.find("ul.orderlist").sortable({axis: "y", handle: "header"});
	    list.on("sortdeactivate", function() {
	      var next = _.map(this.children, function(elm) {
		return Number(elm.getAttribute('fs-id'));
	      });
	      var newList = [];
	      for(var i = 0; i < next.length; i++) {
		newList[i] = filters.list[next[i]];
	      }
	      scope.$apply(function() {
		angular.copy(newList, filters.list);
	      });
	    });
	    var list = scope[iAttrs.fsModel];
	  },
	  post: function postLink(scope, iElement, iAttrs, controller) {
	  }
	}
      },
      templateUrl: 'partials/filterlist.html'
    }
}])
.directive('filteritem', ["FilterItemVisibility", function(vis) {
  return {
    restrict: "EA",
    replace: false,
    transclude: false,
    scope: {
      fsItem: "=",
      fsIndex: "="
    },
    templateUrl: 'partials/filteritem.html'
  }
}])
.directive('fsSelect', ["Types", "Defaults", function(types, defaults) {
  return {
    restrict: "EA",
    replace: false,
    transclude: false,
    scope: {
      fsSelect: "=",
      fsSelType: "="
    },
    link: function(scope, iElement, iAttrs, controller) {
      iElement.change(function() {
	scope.$apply(function() {
	  var t = iAttrs.fsSelType;
	  if(t === 'type') {
	    var newType = types.getTypeById(iElement.val());
	    if(newType.id != scope.fsSelect.id) {
	      scope.fsSelect.type = newType;
	      defaults.getDefaults(scope.fsSelect);
	    }
	  } else if(t === 'blend') {
	    scope.fsSelect = types.getBlendModeById(iElement.val());
	  }
	});
      });
    }
  }
}])

angular.module('filtrstackr.filterlist.controllers', []).
controller('filterItem', ['$scope', 'FilterItemVisibility', 'Filters', function(sc, vis, filters) {
  sc.visibility = vis;
  sc.getVis = function(item) {
    return vis[item.id];
  }
  sc.toggle = function(item) {
    vis[item.id] = !vis[item.id];
  }
  sc.removeFilter = function(item) {
    console.log("tjo");
    filters.remove(item);
  }
}]);

// Declare app level module which depends on filters, and services
angular.module('filtrstackr', [
  'ngRoute',
  'filtrstackr.filters',
  'filtrstackr.services',
  'filtrstackr.directives',
  'filtrstackr.filterlist',
  'filtrstackr.filterlist.directives',
  'filtrstackr.filterlist.controllers',
  'colorpicker.module',
  'filtrstackr.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {controller: 'main'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);

/* Controllers */

angular.module('filtrstackr.controllers', []).
controller('main', ['$scope', 'Types', 'Filters', 'FilterItemVisibility', 'Renderer', function(sc, types, filters, vis, renderer) {
  var urlParameters = window.location.search.split("[?&]").slice(0);
  sc.isDebug = (urlParameters[0] === "debug=1");
  sc.filters = filters.list;
  sc.types = types.list;
  sc.newFilter = function() {
    console.log("addfilter");
    var filter = {};
    filter.type = types.getTypeById('undefined');
    filters.add(filter);
    _.each(vis, function(elm, i, li) {
      vis[i] = false;
    });
    vis[filter.id] = true;
  }
  sc.$watch('filters', function() {
    renderer.drawScene(filters.list);
  }, true);
}]);

/* Filters */

angular.module('filtrstackr.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]);
