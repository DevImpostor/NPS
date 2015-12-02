/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/linq/linq.d.ts" />
/// <reference path="../typings/angular-material/angular-material.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />

var app = angular.module('StarterApp', ['ngMaterial']);

// Main Controller
app.controller('AppCtrl', ['$scope', '$http', '$q', '$mdBottomSheet','$mdSidenav', '$mdDialog', '$mdToast', function($scope, $http, $q, $mdBottomSheet, $mdSidenav, $mdDialog, $mdToast, $animate){
  
  // Toolbar search toggle
  $scope.toggleSearch = function(element) {
    $scope.showSearch = !$scope.showSearch;
  };
  
  // Sidenav toggle
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
  
  // Menu items
 	$scope.menu = getTypes($http, $q)
    .then(function (types) {
      $scope.menu = types.data;
      $scope.setSelectedMenu($scope.menu[0]);
    })
    .catch(function (error) {
      $scope.showToast("Error loading menu", "error");
    });
  
  $scope.currentCatIndex = 0;
  
  $scope.setSelectedMenu = function(item) {
    $scope.selectedMenu = item;
    $scope.currentCatIndex = 0;
    $scope.refreshList();
  }
  
  $scope.records = [];
  $scope.currentFilters = [];
  
  $scope.setFilters = function(filters, append) {
    
    if (append == true) {
      $scope.currentFilters.push(filters)
    }
    else {
      $scope.currentFilters = filters;
    }
    
    $scope.refreshList();
  }
  
  $scope.refreshList = function() {
    getRecords($http, $q, $scope.selectedMenu.name, $scope.currentFilters)
      .then(function (records) {
        $scope.records = records;
      })
      .catch(function (error, emptyArray) {
        $scope.showToast("Records failed to load, created empty list", "error");
        $scope.records = emptyArray;
      });
  }
  
  $scope.pinText = function(item) {
    if (item.pinned == true)
      return "Un-Pin";
    else
      return "Pin";
  }
  
  $scope.changePin = function(item) {
    if (item.pinned == undefined)
      item.pinned = true
    else
      item.pinned = !item.pinned;
      
    item.isDirty = true;
    
    //TODO: Trigger DB Save Routine
    
    $scope.refreshList();
  };
  
  
  $scope.showToast = function(message, theme) {
    if (theme == undefined)
      theme = "info"
    $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position("top right")
        .hideDelay(5000)
        .theme(theme + "-toast")
    );
  };
  
  // Bottomsheet & Modal Dialogs
  $scope.alert = '';
  $scope.showListBottomSheet = function($event) {
    $scope.alert = '';
    $mdBottomSheet.show({
      template: '<md-bottom-sheet class="md-list md-has-header"><md-list><md-list-item class="md-2-line" ng-repeat="item in items" role="link" md-ink-ripple><md-icon md-svg-icon="{{item.icon}}" aria-label="{{item.name}}"></md-icon><div class="md-list-item-text"><h3>{{item.name}}</h3></div></md-list-item> </md-list></md-bottom-sheet>',
      controller: 'ListBottomSheetCtrl',
      targetEvent: $event
    }).then(function(clickedItem) {
      $scope.alert = clickedItem.name + ' clicked!';
    });
  };
  
  $scope.showAdd = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'views/idf.html',
      targetEvent: ev,
    })
    .then(function(answer) {
      $scope.alert = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.alert = 'You cancelled the dialog.';
    });
  };
}]);

app.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {
  $scope.items = [
    { name: 'Share', icon: 'social:ic_share_24px' },
    { name: 'Upload', icon: 'file:ic_cloud_upload_24px' },
    { name: 'Copy', icon: 'content:ic_content_copy_24px' },
    { name: 'Print this page', icon: 'action:ic_print_24px' },
  ];
  
  $scope.listItemClick = function($index) {
    var clickedItem = $scope.items[$index];
    $mdBottomSheet.hide(clickedItem);
  };
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
};

app.controller('DemoCtrl', DemoCtrl);
  function DemoCtrl ($timeout, $q) {
    var self = this;
    // list of `state` value/display objects
    self.states        = loadAll();
    self.selectedItem  = null;
    self.searchText    = null;
    self.querySearch   = querySearch;
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.states.filter( createFilterFor(query) ) : [];
      return results;
    }
    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Ali Conners, Alex, Scott, Jennifer, \
              Sandra Adams, Brian Holt, \
              Trevor Hansen';
      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }
    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }
  };

app.config(function($mdThemingProvider) {
  var customBlueMap = 		$mdThemingProvider.extendPalette('light-blue', {
    'contrastDefaultColor': 'light',
    'contrastDarkColors': ['50'],
    '50': 'ffffff'
  });
  $mdThemingProvider.definePalette('customBlue', customBlueMap);
  $mdThemingProvider.theme('default')
    .primaryPalette('customBlue', {
      'default': '500',
      'hue-1': '50'
    })
    .accentPalette('pink');
  $mdThemingProvider.theme('input', 'default')
        .primaryPalette('grey')
});

app.config(function($mdIconProvider, $mdThemingProvider) {
    $mdIconProvider
      // linking to https://github.com/google/material-design-icons/tree/master/sprites/svg-sprite
      // 
      .iconSet('action', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-action.svg', 24)
      .iconSet('alert', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-alert.svg', 24)
      .iconSet('av', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-av.svg', 24)
      .iconSet('communication', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-communication.svg', 24)
      .iconSet('content', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-content.svg', 24)
      .iconSet('device', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-device.svg', 24)
      .iconSet('editor', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-editor.svg', 24)
      .iconSet('file', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-file.svg', 24)
      .iconSet('hardware', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-hardware.svg', 24)
      .iconSet('image', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-image.svg', 24)
      .iconSet('maps', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-maps.svg', 24)
      .iconSet('navigation', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-navigation.svg', 24)
      .iconSet('notification', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-notification.svg', 24)
      .iconSet('social', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-social.svg', 24)
      .iconSet('toggle', 'https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-toggle.svg', 24)
    
      // Illustrated user icons used in the docs https://material.angularjs.org/latest/#/demo/material.components.gridList
      .iconSet('avatars', 'https://raw.githubusercontent.com/angular/material/master/docs/app/icons/avatar-icons.svg', 24)
      .defaultIconSet('https://raw.githubusercontent.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-action.svg', 24);
      
      $mdThemingProvider.theme('success-toast');
      $mdThemingProvider.theme('error-toast');
      $mdThemingProvider.theme('info-toast');
});
