angular.module('corDemo', ['ui.bootstrap']);

//CONTROLLER

angular.module('corDemo').controller('UserProfileCtrl', function($scope, $log, ModalWorkFlow) {

  // Bob hasnt fully registered yet
  $scope.user = {
    firstName: 'KD',
    lastName: '',
    phone: '',
    email: '',
    status: 'new'
  };

  // kick off
  $scope.begin = function(user) {
    ModalWorkFlow.beginPresentation(angular.copy($scope.user));
  };

  //cancel
  $scope.$on('modalPresentation.canceled', function() {
    $scope.user.status = 'incomplete';
  });

  //finish
  var disconnect = $scope.$on('modalPresentation.finished', function(evt, user) {
    angular.extend($scope.user, user);
    $scope.user.status = 'finished';

    disconnect();
  });

});

//FACTORY - Workflow Model

angular.module('corDemo').factory('ModalWorkFlow', function($modal, $rootScope) {

  function beginPresentation(user) {
    openUserModal.call(user);
  }

  function openUserModal() {
    handler('templates/user.html', this, openInfoModal);
  }

  function openInfoModal() {
    handler('templates/info.html', this, openReviewModal);
  }

  function openReviewModal() {
    handler('templates/review.html', this);
  }

  //what model to load on what state
  function handler(templateUrl, user, nextModalOpenFn) {
    var modal = $modal.open({
      templateUrl: templateUrl,
      controller: 'UserModalCtrl',

      // inject into modal
      resolve: {
        user: function() {
          return user;
        }
      }
    });

    //what to do on user action
    modal.result.then(

      function close(user) {
        if (nextModalOpenFn) {
          nextModalOpenFn.call(user);
        } else {
          $rootScope.$broadcast('modalPresentation.finished', user)
        }
      },

      function dismiss() {
        $rootScope.$broadcast('modalPresentation.canceled')
      }
    );
  }

  // public method
  return {
    beginPresentation: beginPresentation
  }

});

//CONTROLLER

angular.module('corDemo').controller('UserModalCtrl', function($scope, $modalInstance, user) {

  $scope.user = user;

  $scope.ok = function() {
    $modalInstance.close($scope.user);
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

});
