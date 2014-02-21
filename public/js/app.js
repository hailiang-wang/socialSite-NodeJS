$(document).ready(function () {

  // confirmations
  $('.confirm').submit(function (e) {
    e.preventDefault();
    var self = this;
    var msg = 'Are you sure?';
    
    bootbox.confirm(msg, function (action) {
        if (action) {
        	self.submit();
         
        }
      });
  });


  //$('#tags').tagsInput({
   // 'height':'60px',
    //'width':'280px'
  //});

});
