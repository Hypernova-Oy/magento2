/*eslint-disable */
define(["jquery", "knockout", "tabs", "underscore", "Magento_PageBuilder/js/component/event-bus", "Magento_PageBuilder/js/component/block/preview/block"], function (_jquery, _knockout, _tabs, _underscore, _eventBus, _block) {
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var Tabs =
  /*#__PURE__*/
  function (_PreviewBlock) {
    _inheritsLoose(Tabs, _PreviewBlock);

    /**
     * Assign a debounce and delay to the init of tabs to ensure the DOM has updated
     *
     * @type {(() => any) & _.Cancelable}
     */

    /**
     * @param {Block} parent
     * @param {ConfigContentBlock} config
     */
    function Tabs(parent, config) {
      var _this;

      _this = _PreviewBlock.call(this, parent, config) || this;
      _this.focusedTab = _knockout.observable();
      _this.element = void 0;
      _this.buildTabs = _underscore.debounce(function () {
        if (_this.element && _this.element.children.length > 0) {
          try {
            (0, _jquery)(_this.element).tabs("destroy");
          } catch (e) {// We aren't concerned if this fails, tabs throws an Exception when we cannot destroy
          }

          (0, _jquery)(_this.element).tabs({
            create: function create(event, ui) {
              _this.setActiveTab(_this.data.default_active() || 0);
            }
          });
        }
      }, 10);

      _eventBus.on("tabs:block:ready", function (event, params) {
        if (params.id === _this.parent.id && _this.element) {
          _this.buildTabs();
        }
      });

      _eventBus.on("tab:block:create", function (event, params) {
        if (_this.element && params.block.parent.id === _this.parent.id) {
          _this.buildTabs();
        }
      });

      _eventBus.on("tab:block:removed", function (event, params) {
        if (_this.element && params.block.parent.id === _this.parent.id) {
          _this.buildTabs();
        }
      }); // Set the stage to interacting when a tab is focused


      _this.focusedTab.subscribe(function (value) {
        _this.parent.stage.interacting(value !== null);
      });

      return _this;
    }
    /**
     * Set the active tab, we maintain a reference to it in an observable for when we rebuild the tab instance
     *
     * @param {number} index
     */


    var _proto = Tabs.prototype;

    _proto.setActiveTab = function setActiveTab(index) {
      (0, _jquery)(this.element).tabs("option", "active", index);
    };
    /**
     * Set the focused tab
     *
     * @param {number} index
     * @param {boolean} force
     */


    _proto.setFocusedTab = function setFocusedTab(index, force) {
      if (force === void 0) {
        force = false;
      }

      this.setActiveTab(index);

      if (force) {
        this.focusedTab(null);
      }

      this.focusedTab(index);

      if (this.element) {
        _underscore.defer(function () {
          document.execCommand("selectAll", false, null);
        });
      }
    };
    /**
     * On render init the tabs widget
     *
     * @param {Element} element
     */


    _proto.onContainerRender = function onContainerRender(element) {
      this.element = element;
      this.buildTabs();
    };
    /**
     * Handle clicking on a tab
     *
     * @param {number} index
     * @param {Event} event
     */


    _proto.onTabClick = function onTabClick(index, event) {
      // The options menu is within the tab, so don't change the focus if we click an item within
      if ((0, _jquery)(event.target).parents(".pagebuilder-options").length > 0) {
        return;
      }

      this.setFocusedTab(index);
    };
    /**
     * Get the Tab header style attributes for the preview
     *
     * @param {number} index
     * @returns {any}
     */


    _proto.getTabHeaderStyles = function getTabHeaderStyles(index) {
      var mainStyles = this.parent.data.headers.style();
      delete mainStyles.marginBottom;
      var styles = {
        borderBottomColor: "",
        borderBottomStyle: "none",
        borderBottomWidth: "2px",
        marginLeft: "0px"
      };

      if (index !== 0) {
        styles.marginLeft = "-" + this.data.border_width() + "px";
      } // if (index === this.activeTab()) {
      //     styles.borderBottomColor = this.data.border() !== "_default" ?
      //     `rgba(255,255,255,1)` : "transparent";
      //     styles.borderBottomWidth = `${Math.abs(parseInt(mainStyles.marginBottom, 10)) + 1}px`;
      // } else {
      //     styles.borderBottomColor = "transparent";
      // }


      return { ...mainStyles,
        ...styles
      };
    };

    return Tabs;
  }(_block); // Resolve issue with jQuery UI tabs blocking events on content editable areas


  var originalTabKeyDown = _jquery.ui.tabs.prototype._tabKeydown;

  _jquery.ui.tabs.prototype._tabKeydown = function (event) {
    // If the target is content editable don't handle any events
    if ((0, _jquery)(event.target).attr("contenteditable")) {
      return;
    }

    originalTabKeyDown.call(this, event);
  };

  return Tabs;
});
//# sourceMappingURL=tabs.js.map
