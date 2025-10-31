(function ($) {
  $.fn.fileUploadPopup = function (options) {
    var settings = $.extend(
      {
        apiUrl: null,
        buttonHtml: '<i class="fa-solid fa-upload"></i> Upload',
        buttonClass: 'btn btn-sm btn-primary btn-text-icon',
        popupTitle: 'อัปโหลดไฟล์',
        accept: '.png,.jpg,.jpeg,.gif,.pdf,.xls,.xlsx',
        multiple: true,
        onSuccess: null,
        onError: null,
        onRemove: null,
      },
      options
    );

    var fileNames = [];

    return this.each(function () {
      var $originalInput = $(this);

      $originalInput.hide();

      var $uploadBtn = $('<button>', {
        type: 'button',
        class: settings.buttonClass,
        disabled: $originalInput.is('[readonly]'),
      })
        .html(settings.buttonHtml)
        .insertAfter($originalInput);

      var popupId = 'popup-file-' + Date.now();
      var popupHtml = `
                        <div class="file-upload-overlay" style="display:none;">
                          <div class="file-upload-popup">
                            <div class="popup-header">
                              <h3>${settings.popupTitle}</h3>
                              <button class="btn-close"><i class="fa-solid fa-x"></i></button>
                            </div>
                            <div class="popup-body">
                              <div class="upload-area">
                                <input 
                                  type="file" 
                                  id="${popupId}" 
                                  class="popup-file-input" 
                                  accept="${settings.accept}" 
                                  ${settings.multiple ? 'multiple' : ''}
                                >
                                <label for="${popupId}" class="upload-label">
                                  <span class="upload-icon">
                                    <i class="fa-solid fa-folder-open"></i>
                                  </span>
                                  <span class="upload-text">คลิกเพื่อเลือกไฟล์</span>
                                </label>
                              </div>
                              <div class="loading" style="display:none;">
                                <span class="spinner"></span>
                                <span>กำลังอัปโหลด...</span>
                              </div>
                              <div class="file-list"></div>
                            </div>
                          </div>
                        </div>
                      `;

      var $overlay = $(popupHtml).appendTo('body');
      var $fileInput = $overlay.find('.popup-file-input');
      var $fileList = $overlay.find('.file-list');
      var $loading = $overlay.find('.loading');

      addStyles();

      $uploadBtn.on('click', function () {
        $overlay.fadeIn(300);
      });

      $overlay.find('.btn-close').on('click', closePopup);
      $overlay.on('click', function (e) {
        if ($(e.target).hasClass('file-upload-overlay')) {
          closePopup();
        }
      });

      $fileInput.on('change', function () {
        var files = this.files;
        if (files.length > 0) {
          uploadFiles(files);
        }
      });

      function uploadFiles(files) {
        var formData = new FormData();

        var fieldName = settings.fieldName || $originalInput.attr('name') || 'files';

        for (var i = 0; i < files.length; i++) {
          formData.append(fieldName, files[i]);
        }

        $loading.show();
        $fileList.empty();

        $.ajax({
          url: settings.apiUrl + '/api/v1/filecontrol?destination=' + settings.destination,
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          xhrFields: {
            withCredentials: true,
          },
          success: function (res) {
            $loading.hide();

            fileNames = res.data;

            $originalInput.closest('.form-input')[0]._uploadedFiles = fileNames;

            displayFileList(fileNames);
          },
          error: function (xhr, status, error) {
            $loading.hide();

            var errorMsg = xhr.responseJSON?.message || 'เกิดข้อผิดพลาดในการอัปโหลด';

            $fileList.html(`
                            <div class="error-message">
                              <span class="error-icon">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                              </span>
                              <span>${errorMsg}</span>
                            </div>
                          `);

            if (settings.onError) {
              settings.onError(error);
            }
          },
        });

        $fileInput.val('');
      }

      function displayFileList(fileNames) {
        if (!fileNames || fileNames.length === 0) {
          $fileList.html('<p class="no-files">ไม่มีไฟล์</p>');
          return;
        }

        var listHtml =
          '<div class="file-list-header">ไฟล์ที่อัปโหลดสำเร็จ:</div><ul class="files">';

        fileNames.forEach(function (fileName, index) {
          var { name, destination } = fileName;

          listHtml += `
                        <li class="file-item" data-index="${index}">
                          <span class="file-icon">
                            <i class="fa-solid fa-file-lines"></i>
                          </span>
                          <span class="file-name">
                            <a href="${settings.apiUrl}/${destination}/${name}" target="_blank">${name}</a>
                          </span>
                          <button class="btn-remove" data-filename="${name}" title="ลบไฟล์">
                            <span class="remove-icon"><i class="fa fa-trash"></i></span>
                          </button>
                        </li>
                      `;
        });

        listHtml += '</ul>';
        $fileList.html(listHtml);

        $fileList.find('.btn-remove').on('click', function () {
          var $btn = $(this);
          var $item = $btn.closest('.file-item');
          var index = $item.data('index');
          var deletedFile = fileNames[index];

          fileNames.splice(index, 1);

          $originalInput.closest('.form-input')[0]._uploadedFiles = fileNames;

          displayFileList(fileNames);

          if (settings.onRemove) {
            settings.onRemove(deletedFile);
          }
        });
      }

      function closePopup() {
        $overlay.fadeOut(300);
        $fileList.empty();
        $fileInput.val('');
        if (settings.onSuccess) {
          settings.onSuccess(fileNames);
        }
      }

      function addStyles() {
        if (!$('#file-upload-plugin-styles').length) {
          var css = `
                      <style id="file-upload-plugin-styles">
                        .file-name a {
                          display: inline-block;
                          max-width: 400px;     /* ความกว้างสูงสุด */
                          white-space: nowrap;  /* ไม่ตัดบรรทัด */
                          overflow: hidden;     /* ซ่อนข้อความเกิน */
                          text-overflow: ellipsis; /* แสดง ... */
                          vertical-align: middle;
                          color: var(--primary_text_color);
                          text-decoration:none
                        }
                        .file-name a:hover{
                          text-decoration: underline
                        }
                        .file-upload-overlay {
                          position: fixed;
                          top: 0;
                          left: 0;
                          width: 100%;
                          height: 100%;
                          background: rgba(0,0,0,0.5);
                          z-index: 9999;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                        }
                        .file-upload-popup {
                          background: var(--content_background_color);
                          border-radius: 1rem;
                          width: 100%;
                          max-width: 600px;
                          max-height: 80vh;
                          overflow: hidden;
                          display: flex;
                          flex-direction: column;
                        }
                        .popup-header {
                          display: flex;
                          justify-content: space-between;
                          align-items: center;
                          padding: 1rem;
                          border-bottom: 1px solid var(--grey_300_color);
                        }
                        .btn-close {
                          background: none;
                          border: none;
                          font-size: 28px;
                          cursor: pointer;
                          color: var(--grey_500_color);
                          line-height: 1;
                          padding: 0;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                        }
                        .btn-close:hover {
                          color: var(--grey_600_color);
                        }
                        .popup-body {
                          padding: 1rem;
                          overflow-y: auto;
                          gap: 2rem;
                          display: flex;
                          flex-direction: column;
                        }
                        .upload-area {
                          border: 2px dashed var(--grey_300_color);
                          border-radius: 1rem;
                          padding: 1rem;
                          text-align: center;
                          transition: all 0.3s;
                        }
                        .upload-area:hover {
                          border-color: var(--primary_main_color);
                          background: var(--primary_main_6_color);
                        }
                        .popup-file-input {
                          display: none;
                        }
                        .upload-label {
                          cursor: pointer;
                          display: flex;
                          flex-direction: column;
                          gap: 1rem;
                        }
                        .upload-icon {
                          display: block;
                        }
                        .upload-text {
                          color: var(--caption_text_color);
                          font-size: 1.5rem;
                        }
                        .loading {
                          text-align: center;
                          padding: 1rem;
                          color: var(--caption_text_color);
                        }
                        .spinner {
                          display: inline-block;
                          width: 20px;
                          height: 20px;
                          border: 3px solid var(--main_background_color);
                          border-top: 3px solid var(--primary_main_color);
                          border-radius: 50%;
                          animation: spin 1s linear infinite;
                          margin-right: 10px;
                        }
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                        .files {
                          list-style: none;
                          padding: 0;
                          margin: 0;
                          display: flex;
                          gap: 1rem;
                          flex-direction: column;
                        }
                        .file-item {
                          padding: 1rem;
                          border: 1px solid var(--grey_250_color);
                          border-radius: 0.5rem;
                          display: flex;
                          align-items: center;
                          background: var(--content_background_color);
                          transition: background 0.2s;
                          gap: 1rem;
                        }
                        .file-item:hover {
                          background: var(--grey_200_color);
                        }
                        .file-icon i, .remove-icon i{
                          font-size: 2rem;
                        }
                        .file-name {
                          flex: 1;
                          word-break: break-all;
                        }
                        .btn-remove {
                          background: var(--error_main_color);
                          color: var(--primary_text_contrast_color);
                          border: none;
                          border-radius: 0.5rem;
                          padding: 0 1rem;
                          cursor: pointer;
                          font-size: var(--body_font_size);
                          margin-left: 10px;
                          transition: background 0.2s;
                          display: flex;
                          align-items: center;
                          height: 4rem
                        }
                        .btn-remove:hover {
                          background: var(--error_hover_color);
                        }
                        .no-files {
                          text-align: center;
                          color: var(--disable_text_color);
                          padding: 1rem;
                        }
                        .error-message {
                          padding: 1rem;
                          background: var(--error_main_12_color);
                          color: var(--error_main_color);
                          border: 1px solid var(--error_main_12_color);
                          border-radius: 0.5rem;
                          display: flex;
                          align-items: center;
                          gap: 1rem;
                        }
                        .error-icon i{
                          font-size: 2rem;
                        }
                        .upload-icon i {
                          font-size: 3rem;
                        }
                        .file-list{
                          display: flex;
                          flex-direction: column;
                          gap: 1rem;
                        }
                        .file-upload-popup .spinner::before, .file-upload-popup .spinner::after {
                          display: none;
                        }
                      </style>
                    `;
          $('head').append(css);
        }
      }
    });
  };
})(jQuery);
