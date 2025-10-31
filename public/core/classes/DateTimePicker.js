(function ($) {
  $.fn.dateTimePicker = function (methodOrOptions, ...args) {
    if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      const config = $.extend(
        {
          type: 'date', // 'date' | 'time' | 'datetime' | 'range'
          allowInput: false,
          dateFormat: 'd/m/Y',
          onChange: null,
        },
        methodOrOptions
      );

      return this.each(function () {
        let typeConfig = {};

        switch (config.type) {
          case 'time':
            typeConfig = {
              enableTime: true,
              noCalendar: true,
              dateFormat: 'H:i',
              time_24hr: true,
            };
            break;

          case 'datetime':
            typeConfig = {
              enableTime: true,
              dateFormat: 'd/m/Y H:i',
              time_24hr: true,
            };
            break;

          case 'range':
            typeConfig = {
              mode: 'range',
              dateFormat: 'd/m/Y',
            };
            break;
        }

        const flatpickrConfig = $.extend({}, config, typeConfig, {
          onChange: function (selectedDates, dateStr, instance) {
            if (typeof config.onChange === 'function') {
              config.onChange(dateStr, selectedDates, instance);
            }
          },
        });

        const $el = $(this);
        if ($el.is('[readonly]')) return;

        const instance = flatpickr(this, flatpickrConfig);
        $el.data('dateTimePicker', instance);
      });
    } else if (typeof methodOrOptions === 'string') {
      const method = methodOrOptions;

      const instance = this.data('dateTimePicker');

      if (!instance) {
        console.warn('dateTimePicker instance not found for this element.');
        return this;
      }

      switch (method) {
        case 'setDate':
          instance.setDate(...args);
          break;
        case 'clear':
          instance.clear();
          break;
        case 'open':
          instance.open();
          break;
        case 'close':
          instance.close();
          break;
        case 'getValue':
          return {
            dateStr: instance.input.value,
            value: instance.selectedDates,
            instance: instance,
          };
        case 'setMinDate':
          if (instance && instance.setOptions) {
            instance.setOptions({ minDate: args[0] });
          } else if (instance && instance.config) {
            instance.config.minDate = args[0];
          } else {
            console.warn('dateTimePicker: cannot set minDate on this instance');
          }
          break;
        case 'destroy':
          if (instance) {
            instance.destroy();
            this.removeData('dateTimePicker');
          }
          break;
        default:
          console.warn(`Unknown method: ${method}`);
      }

      return this;
    }
  };
})(jQuery);
