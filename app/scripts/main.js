$('#myTab a').click(function (e) {
    'use strict';

    e.preventDefault();
    $(this).tab('show');
});