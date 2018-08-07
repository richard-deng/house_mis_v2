$(document).ready(function(){

    $('#summernote').summernote({
        minHeight: 500,
        // maxHeight: 320,
        // minWidth: 512,
        // maxWidth: 512,
        focus: true,
        lang: 'zh-CN',
        dialogsInBody: true,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['insert', ['picture', 'link']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ],
        callbacks: {
            onImageUpload: function(files) {
                //由于summernote上传图片上传的是二进制数据
                //所以这里可以自己重新上传图片方法
                var formData = new FormData();
                var name = files[0]['name'];
                console.log('name:', name);
                formData.append('file',files[0]);
                formData.append("name", name);
                $.ajax({
                    url : '/mis/v1/api/icon/upload', //后台文件上传接口
                    type : 'POST',
                    data : formData,
                    processData : false,
                    contentType : false,
                    success : function(data) {
                        console.log('data:', data);
                        detail_data = data.data;
                        src = detail_data.icon_url;
                        //设置到编辑器中
                        $('#summernote').summernote('insertImage',src,'img');
                    },
                    error:function(){
                        alert("上传失败...");
                    }
                });
            },
	    onInit: function() {
	        console.log('Summernote is launched');
                initial_agreement();
	    },
        }
    });


    function initial_agreement(){
        var se_userid = window.localStorage.getItem('myid');
        var get_data = {};
        get_data.se_userid = se_userid;
        $.ajax({
            url: '/mis/v1/api/agreement/view',
            type: 'GET',
            dataType: 'json',
            data: get_data,
            success: function(data) {
                var respcd = data.respcd;
                if(respcd !== '0000'){
                    var resperr = data.resperr;
                    var respmsg = data.respmsg;
                    var msg = resperr ? resperr : respmsg;
                    toastr.warning(msg);
                    return false;
                } else {
                    detail_data = data.data;
                    content = detail_data.content;
                    $('#summernote').summernote('code', content);
                }
            },
            error: function(data) {
                toastr.warning('请求数据异常');
            }

        });
    }

    $('#save_agreement').click(function(){
        var se_userid = window.localStorage.getItem('myid');
        var post_data = {};
        post_data.se_userid = se_userid;
         var content = $('#summernote').summernote('code');
         if(!content){
             toastr.warning('请填写协议内容然后保存');
             return false;
         }

         post_data.content = content;
         $.ajax({
	     url: '/mis/v1/api/agreement/view',
	     type: 'POST',
	     dataType: 'json',
	     data: post_data,
	     success: function(data) {
                 var respcd = data.respcd;
                 if(respcd !== '0000'){
                     var resperr = data.resperr;
                     var respmsg = data.respmsg;
                     var msg = resperr ? resperr : respmsg;
                     toastr.warning(msg);
                     return false;
                 }
                 else {
                     toastr.success('保存修改成功');
                     $("#boxViewForm").resetForm();
                     $("#boxViewModal").modal('hide');
                     $('#boxList').DataTable().draw();
                 }
	     },
	     error: function(data) {
                 toastr.warning('请求异常');
	     }
         });
    });

});
