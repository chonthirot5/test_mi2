class Tabs {
  constructor(config = {}) {
    this.width = config.width || 'auto';
    this.height = config.height || 'auto';
    this.position = config.position || 'top';
    this.collapsible = config.collapsible !== false;
    this.scrollPosition = config.scrollPosition || 'both';
    this.selectedItem = config.selectedItem || 0;
    this.selector = config.selector || '.tabs';

    this.init();
  }

  init() {
    if ($(this.selector).length === 0) {
      return;
    }

    $(this.selector).jqxTabs({
      position: this.position,
      collapsible: this.collapsible,
      scrollPosition: this.scrollPosition,
      selectedItem: this.selectedItem,
      width: this.width,
      height: this.height,
    });
  }
}
