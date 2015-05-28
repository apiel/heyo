/*
 * jquery.activity
 */
(function ($) {     
    var Activity = function () {
        //this.init();
    };
    Activity.prototype = {
        config: {
          url: "http://activity.alexparadise.com/activity.php",
        },
        data: null,
        gcmId: null,
        init: function() { 
            var me = this;
            me.render();
            
            $("[data-role=panel]").enhanceWithin().panel();
            
            me.initEvent();
            alert(me.getGoogleEmail());
            me.query('getProfile');
        },
        getGoogleEmail: function() {
            var email = null;
            var deviceInfo = cordova.require("cordova/plugin/DeviceInformation");
            deviceInfo.get(function(result) {
                result = $.parseJSON(result);
                $.each(result.accounts, function() {
                  if (this.type === 'com.google') {
                    email = this.name;
                    return false;
                  }
                });
                alert(email);
            });  
            return email;
        },
        initEvent: function() {
            var me = this;
            var trigger = null;
            $('#pagetwo .ui-content').off('click').on('click', 'li[activity-id]', function() {
              $.mobile.loading( 'show', {theme: 'b', textVisible: true, text: 'processing'});
              me.query('follow', {friendId: $(this).attr('friend-id'), activityId: $(this).attr('activity-id') })
            });
            $('#activity-li').on('click', 'a[data-rel="popup"]', function() { trigger = $(this); });
            $("#activity-delete, #activity-notify").on("popupbeforeposition", function( event, ui ) {
              var id = trigger.parent().attr('activity-id');
              $(this).find('input[name="activityId"]').val(id);
              var div = $(this).find('div');
              div.html('');
              $.each(me.data.activities[id].followers, function() {
                div.append('<img src="'+me.data.friends[this].picture.data.url+'" />');
              });
              $(this).find('h2').text(trigger.parent().find('h2').text());
              $(this).find('textarea').val('');
              $(this).find('p b').text(trigger.parent().find('p b').text());
            });
            $( "#activity-edit" ).on( "popupafteropen", function( event, ui ) {
              $('#activity-edit input[name="name"]').val('');
            });
            $('#activity-edit :submit').off('click').click(function() {
              $.mobile.loading( 'show', {theme: 'b', textVisible: true, text: 'saving'});
              me.query('activityAdd', $('#activity-edit'));
              $('#activity-edit').popup( "close" );
            });
            $('#activity-delete :submit').click(function() {
              $.mobile.loading( 'show', {theme: 'b', textVisible: true, text: 'processing'});
              me.query('activityDelete', $('#activity-delete'));
              $('#activity-delete').popup( "close" );
            });
            $('#activity-notify :submit').click(function() {
              $.mobile.loading( 'show', {theme: 'b', textVisible: true, text: 'processing'});
              me.query('notify', $('#activity-notify'));
              $('#activity-notify').popup( "close" );
              $.mobile.pageContainer.pagecontainer("change", "#pagethree");
              return false;
            });
            $('.profile a[href="#logout"]').click(function() {
              me.data = null;
              localStorage.removeItem('data');
              window.location = me.config.url + '?action=logout'; 
              // on login save gmcid
            });
            $('.profile a[href="#refresh"]').click(function() {
              me.query('getProfile');
            });
            $('#pagethree .ui-content ul').on('click', 'li', function() {
              $('#notification-response :input[name=response]').val('');
              var notification = me.data.notifications[$(this).attr('data-id')];
              $('#notification-response input[name=notificationId]').val(notification.time + '_' + notification.activitiyId);
              $('#notification-response').popup("open", {
                positionTo: '#' + $(this).attr('id') 
              });
            });
            $('#notification-response :submit').off('click').click(function() {
              $.mobile.loading( 'show', {theme: 'b', textVisible: true, text: 'sending'});
              me.query('notificationResponse', $('#notification-response'));
              $('#notification-response').popup( "close" );
            });
//            $(document).on('pagebeforeshow', function() {
//              var activePage = $.mobile.activePage.attr('id');
//              if (activePage !== 'pagefb') {
//                localStorage.setItem('activePage', activePage);
//              }
//            });
        },
        loadData: function() {
          var me = this;
          me.data = JSON.parse(localStorage.getItem('data'));
          me.gcmId = JSON.parse(localStorage.getItem('gcmId'));
          return me.data;
        },
        pagefb: function(url) {
          var me = this;
          //console.log(me.data);
          if (me.data) {
            window.location = url;
          }
          else {
            $('#pagefb .ui-content a').attr('href', url);
            $(':mobile-pagecontainer').pagecontainer('change', '#pagefb', { reverse: false, changeHash: false });
          }
        },
        render: function() {
          var me = this;
          var rendered = false;
          if (me.loadData()) {
            me.renderData();
            rendered = true;            
          }
          return rendered;
        },
        renderData: function() {
          var me = this;
          me.renderProfile(me.data.profile);
          me.renderActivities(me.data.activities);
          me.renderFriends(me.data.friends);
          me.renderNotifications(me.data.notifications, me.data.friends);
        },
        queryResponse: function(response) {
          var me = this;
          if (typeof(response.data) !== 'undefined') {
            me.data = response.data;
            localStorage.setItem('data', JSON.stringify(response.data));
            me.renderData();
          }
          if (typeof(response.gcmId) !== 'undefined') {
            localStorage.setItem('gcmId', JSON.stringify(response.gcmId));
            me.gcmId = true;
          }
          if (typeof(response.redirect) !== 'undefined') {
            if (me.data) window.location = response.redirect;
            else me.pagefb(response.redirect);
          } 
//          else {
//            var activePage = localStorage.getItem('activePage');
//            if (activePage) {
//              $.mobile.pageContainer.pagecontainer("change", "#" + activePage);
//            }
//          } 
        },
        query: function(action, param) {
          var me = this;
          var _param = {action: action};
          if (typeof(param) !== 'undefined') {
            if (param instanceof jQuery)
              param.find(':input[name]').each(function () { _param[$(this).attr('name')] = $(this).val(); });
            else
              _param = $.extend(_param, param);
          }
          if (me.gcmId && me.gcmId !== true) {
            _param.gcmId = me.gcmId;
          }
          if (me.data) {
            _param.token = me.data.token;
          }
          $.get(me.config.url,
                  _param,
                  function(response) {
                    $.mobile.loading('hide');
                    me.queryResponse(response);
                  }, "json");
        },
        renderProfile: function(profile) {
            $('.profile img').attr('src', profile.picture.data.url);
            $('.profile span').text(profile.name);
        },
        renderActivities: function(activities) {
          $('#activity-li li:not(.ui-last-child)').remove();
          $.each(activities, function(id, activity) {
            var li = $('#activity-li-template li').clone();
            li.find('h2').text(activity.name);
            li.attr('activity-id', id);
            li.find('p b').text(activity.followers.length);
            $('#activity-li').prepend(li);
          });
          $('#activity-li li:first').addClass('ui-first-child');
        },   
        renderFriends: function(friends) {
          var me = this;
          var ul = $('#pagetwo .ui-content ul');
          ul.html('');
          $.each(friends, function(id, friend) {
            ul.append('<li id="'+id+'" data-role="list-divider"><img src="'+friend.picture.data.url+'" /> <h2>' + friend.name + '</h2></li>');
            var empty = true;
            $.each(friend.activities, function(idActitivty, activity) {
              empty = false;
              ul.append('<li '+(activity.followers.indexOf(me.data.profile.id)!==-1?'class="following"':'')+' data-icon="star" data-filtertext="'+friend.name+' '+activity.name+'" friend-id="'+id+'" activity-id="'+idActitivty+'"><a href="#">'+activity.name+'<span class="ui-li-count">'+activity.followers.length+' followers</span></a></li>');
            });
            if (empty) {
              ul.append('<li data-filtertext="'+friend.name+'">No activity.</li>');
            }
          });
          ul.listview().listview('refresh');
        },
        getNotificationProfile: function(senderId, friends) {
            return senderId === this.data.profile.id ?
                             this.data.profile : friends[senderId];          
        },
        renderNotificationDetails: function(time, profile) {
            var date = new Date(time*1000);
            return ' <i>by <b>'+profile.name+'</b> ' + date.toLocaleString() + '</i>';
        },
        renderNotifications: function(notifications, friends) {
          var me = this;
          var ul = $('#pagethree .ui-content ul');
          ul.html('');
          $.each(notifications, function(id, notification) {
            var profile = me.getNotificationProfile(notification.senderId, friends);
            ul.append('<li id="notification-'+id+'" data-id="'+id+'"><img src="'+profile.picture.data.url+'" /> '
                    + '<h2>' + notification.activity.name + '</h2><p>' 
                    + notification.details 
                    + me.renderNotificationDetails(notification.time, profile)
                    + '</p>'
                    + me.renderNotificationsResponses(notification, friends)
                    + '</li>');
          });
          ul.listview().listview('refresh');
        },
        renderNotificationsResponses: function(notification, friends) {
          var me = this;
          var responses = '';
          if (typeof(notification.responses) !== 'undefined') {
            $.each(notification.responses, function() {
              var profile = me.getNotificationProfile(this.senderId, friends);
              responses += '<p class="response">' + this.response 
                      + me.renderNotificationDetails(this.time, profile)
                      + '</p>';
            });
          }
          return responses;
        },
        onNotificationGCM: function(e) {
          var me = this;
          if (e.event === 'registered') {
            if (e.regid.length > 0) { me.gcmId = e.regid; me.query('getProfile'); }
          }
          else if (e.event === 'message') {
            me.query('getProfile');
            if (e.payload.type === 'new_activity') {
              $.mobile.pageContainer.pagecontainer("change", "#pagetwo");
              $.mobile.silentScroll($("li[activity-id='" + e.payload.activity_id + "']").offset().top);
            }
            else {
              $.mobile.pageContainer.pagecontainer("change", "#pagethree");
            }
          }
          else {
            alert('Something went wrong. If problem persists please contact us. ' 
                    + e.event + (e.event === 'error' ? ': ' + e.msg : ''));
          }
        },
    };
    
    $.activity = new Activity();
    
    $.fn.activity = function(action, options) {
		$(this).each(function() {
			if (action === 'push') $.activity.yoyo($(this), options);
		});
    };
}(jQuery));