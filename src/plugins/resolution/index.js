import { AbstractPlugin, DEFAULTS, EVENTS, PSVError, registerButton } from 'photo-sphere-viewer';
import { ResolutionButton } from './ResolutionButton';
import './style.scss';
import { deepEqual } from './utils';

// add resolution button
DEFAULTS.navbar.splice(DEFAULTS.navbar.indexOf('fullscreen'), 0, ResolutionButton.id);
DEFAULTS.lang[ResolutionButton.id] = 'Resolution';
registerButton(ResolutionButton);

/**
 * @typedef {Object} PSV.plugins.ResolutionPlugin.Resolution
 * @property {string} name
 * @property {string|string[]|PSV.Cubemap} panorama
 */

/**
 * @typedef {Object} PSV.plugins.ResolutionPlugin.Options
 * @property {Object<String, PSV.plugins.ResolutionPlugin.Resolution>} resolutions
 */

/**
 * @summary Adds a button to choose between multiple resolutions of the panorama.
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */
export default class ResolutionPlugin extends AbstractPlugin {

  static id = 'resolution';

  /**
   * @summary Available events
   * @enum {string}
   * @memberof PSV.plugins.ResolutionPlugin
   * @constant
   */
  static EVENTS = {
    RESOLUTION_CHANGED: 'resolution-changed',
  };

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.plugins.ResolutionPlugin.Options} options
   */
  constructor(psv, options) {
    super(psv);

    /**
     * @summary Available resolutions
     * @member {Object<String, PSV.plugins.ResolutionPlugin.Resolution>}
     */
    this.resolutions = options.resolutions;

    /**
     * @type {Object}
     * @property {string} resolution - Current resolution
     * @private
     */
    this.prop = {
      resolution: null,
    };

    this.psv.on(EVENTS.PANORAMA_LOADED, this);
  }

  /**
   * @package
   */
  destroy() {
    this.psv.off(EVENTS.PANORAMA_LOADED, this);

    super.destroy();
  }

  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  handleEvent(e) {
    if (e.type === EVENTS.PANORAMA_LOADED) {
      this.__onPanoramaLoaded(this.psv.config.panorama);
    }
  }

  /**
   * @summary Changes the current resolution
   * @param {string} id
   */
  setResolution(id) {
    if (!this.resolutions[id]) {
      throw new PSVError(`Resolution ${id} unknown`);
    }

    return this.psv.setPanorama(this.resolutions[id].panorama, { transition: false, showLoader: false });
  }

  /**
   * @summary Returns the current resolution
   * @return {string}
   */
  getResolution() {
    return this.prop.resolution;
  }

  /**
   * @summary Updates current resolution on panorama load
   * @param panorama
   * @private
   */
  __onPanoramaLoaded(panorama) {
    this.prop.resolution = Object.keys(this.resolutions).find((id) => {
      return deepEqual(panorama, this.resolutions[id].panorama);
    });

    this.trigger(ResolutionPlugin.EVENTS.RESOLUTION_CHANGED, this.prop.resolution);
  }

}
