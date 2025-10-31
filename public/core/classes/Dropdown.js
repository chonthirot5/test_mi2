(function ($) {
  $.fn.dropdownSelect2 = function (methodOrOptions) {
    if (typeof methodOrOptions === 'object' || !methodOrOptions) {
      const config = $.extend(
        {
          placeholder: 'Select',
          allowClear: true,
          options: [],
          selectedValue: null,
          allowSearch: false,
          onSelect: null,
          onClear: null,
          ajax: null,
          minimumInputLength: 0,
        },
        methodOrOptions
      );

      return this.each(function () {
        const $select = $(this);
        $select.empty();

        const isMultiple = $select.is('[multiple]');

        if (!isMultiple && !config.ajax) {
          $select.append(new Option('', '', false, false));
        }

        if (!config.ajax && config.options.length > 0) {
          config.options.forEach((opt) => {
            if (opt.group) {
              const $group = $('<optgroup>').attr('label', opt.group);
              opt.items.forEach((item) =>
                $group.append(new Option(item.text, item.value, false, false))
              );
              $select.append($group);
            } else {
              $select.append(new Option(opt.text, opt.value, false, false));
            }
          });
        }

        let $dropdownParent = $select.closest('.modal');
        if (!$dropdownParent.length) {
          $dropdownParent = $('body');
        }

        const select2Config = {
          placeholder: config.placeholder,
          allowClear: config.allowClear,
          width: '100%',
          minimumResultsForSearch: config.allowSearch ? 0 : Infinity,
          dropdownParent: $dropdownParent,
          disabled: $select.is('[disabled]') || $select.is('[readonly]'),
        };

        if (config.ajax) {
          select2Config.minimumInputLength = config.minimumInputLength;
          select2Config.ajax = {
            url: config.ajax.url,
            dataType: config.ajax.dataType || 'json',
            delay: config.ajax.delay || 250,
            data:
              config.ajax.data ||
              function (params) {
                return {
                  q: params.term,
                  page: params.page || 1,
                };
              },
            processResults:
              config.ajax.processResults ||
              function (data) {
                return {
                  results: data.map((item) => ({
                    id: item.value || item.id,
                    text: item.text || item.name,
                  })),
                };
              },
            cache: config.ajax.cache !== false,
          };
        }

        $select.select2(select2Config);

        if (config.selectedValue != null) {
          if (config.ajax && config.selectedValue) {
            const values = Array.isArray(config.selectedValue)
              ? config.selectedValue
              : [config.selectedValue];
            values.forEach((val) => {
              if (typeof val === 'object') {
                const option = new Option(val.text, val.value, true, true);
                $select.append(option);
              } else {
                $select.append(new Option(val, val, true, true));
              }
            });
          }
          $select.val(config.selectedValue).trigger('change');
        }

        let lastSelectedValue = null;
        let beforeClearValues = [];
        let isClearing = false;

        $select.on('select2:select', function (e) {
          isClearing = false;
          const selectedValue = $(this).val();
          const data = e.params.data;

          const findOptionObjects = (values) => {
            if (config.ajax) {
              if (Array.isArray(values)) {
                const selected = [];
                values.forEach((v) => {
                  const opt = $select.find(`option[value="${v}"]`);
                  if (opt.length) {
                    const data = $select.select2('data').find((d) => d.id === v);
                    if (data) selected.push(data);
                  }
                });
                return selected;
              } else {
                return data;
              }
            }

            const allOptions = [];
            config.options.forEach((opt) => {
              if (opt.group && opt.items) {
                allOptions.push(...opt.items);
              } else {
                allOptions.push(opt);
              }
            });
            $(this).data('dropdownSelect2Options', allOptions);

            if (Array.isArray(values)) {
              return allOptions.filter((o) => values.includes(o.value));
            } else {
              return allOptions.find((o) => o.value === values) || null;
            }
          };

          const selectedObjects = findOptionObjects(selectedValue);
          lastSelectedValue = selectedObjects;

          beforeClearValues = Array.isArray(selectedObjects)
            ? [...selectedObjects]
            : selectedObjects
            ? [selectedObjects]
            : [];

          if (typeof config.onSelect === 'function') {
            config.onSelect(selectedObjects);
          }
        });

        if (config.isMultiple) {
          $select.on('select2:clear', function () {
            isClearing = true;

            const removedObjects = beforeClearValues;

            if (typeof config.onClear === 'function') {
              config.onClear({
                removed: removedObjects,
                remaining: [],
              });
            }

            beforeClearValues = [];
            lastSelectedValue = null;
          });

          $select.on('select2:unselect', function (e) {
            if (isClearing) return;

            const data = e.params.data;
            const unselectedObject = { value: data.id, text: data.text };

            const currentValues = $(this).val() || [];

            let remainingObjects = [];

            if (config.ajax) {
              currentValues.forEach((v) => {
                const opt = $select.find(`option[value="${v}"]`);
                if (opt.length) {
                  remainingObjects.push({ value: v, text: opt.text() });
                }
              });
            } else {
              const allOpts = $(this).data('dropdownSelect2Options') || [];
              remainingObjects = allOpts.filter((o) => currentValues.includes(o.value));
            }

            lastSelectedValue = remainingObjects;
            beforeClearValues = [...remainingObjects];

            if (typeof config.onClear === 'function') {
              config.onClear({
                removed: unselectedObject,
                remaining: remainingObjects,
              });
            }
          });
        } else {
          $select.on('select2:clear', function () {
            isClearing = true;

            if (typeof config.onClear === 'function') {
              config.onClear(lastSelectedValue);
            }

            lastSelectedValue = null;
          });
        }
      });
    } else if (typeof methodOrOptions === 'string') {
      const method = methodOrOptions;

      switch (method) {
        case 'getSelected': {
          const $el = this.first();
          const val = $el.val();

          if (Array.isArray(val)) {
            return val.map((v) => {
              const opt = $el.find(`option[value="${v}"]`);
              return { value: v, text: opt.text() };
            });
          } else if (val) {
            const opt = $el.find(`option[value="${val}"]`);
            return { value: val, text: opt.text() };
          }
          return null;
        }

        case 'clear': {
          const $el = this.first();
          const valBeforeClear = $el.val();
          let clearedItems = null;

          if (Array.isArray(valBeforeClear)) {
            clearedItems = valBeforeClear.map((v) => {
              const opt = $el.find(`option[value="${v}"]`);
              return { value: v, text: opt.text() };
            });
          } else if (valBeforeClear) {
            const opt = $el.find(`option[value="${valBeforeClear}"]`);
            clearedItems = { value: valBeforeClear, text: opt.text() };
          }

          this.val(null).trigger('change');
          return clearedItems;
        }

        case 'setSelected': {
          const $el = this.first();
          const values = arguments[1];

          if (values && typeof values === 'object' && !Array.isArray(values) && values.text) {
            const option = new Option(values.text, values.value, true, true);
            $el.append(option);
            $el.val(values.value).trigger('change');
          } else if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'object') {
            values.forEach((val) => {
              const option = new Option(val.text, val.value, true, true);
              $el.append(option);
            });
            $el.val(values.map((v) => v.value)).trigger('change');
          } else {
            $el.val(values).trigger('change');
          }
          return this;
        }

        case 'destroy': {
          return this.each(function () {
            const $el = $(this);
            if ($el.data('select2')) {
              $el.select2('destroy');
            }
            $el.off('.select2');
            $el.off('select2:select select2:clear select2:unselect');
            $el.removeData('dropdownSelect2Options');
          });
        }

        default:
          console.warn(`Unknown method: ${method}`);
          return this;
      }
    }
  };
})(jQuery);
