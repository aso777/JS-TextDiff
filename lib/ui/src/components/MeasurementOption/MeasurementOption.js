import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import i18next from 'i18next';

import selectors from 'selectors';

import './MeasurementOption.scss';

class MeasurementOption extends React.Component {
  static propTypes = {
    /**
     * The current scale of a measurement tool that is consisted of two arrays
     * The first array represents the document scale and the second array represents the world scale
     * For example [[1, 'in'], [4, 'ft']] means 1 inch measured in the document is equal to 4 feet in the real world
     */
    scale: PropTypes.arrayOf(PropTypes.array).isRequired,
    /**
     * The current precision of a measurement tool that is used to determine how many decimal places a calculated value should display
     * Calculated value depends on what the measurement tool is. For example it is distance for distance measurement tool
     */
    precision: PropTypes.number.isRequired,
    /**
     * A prop that is passed down from translate HOC and is used to internationalize strings
     */
    t: PropTypes.func.isRequired,
    measurementUnits: PropTypes.shape({
      from: PropTypes.array,
      to: PropTypes.array,
    }).isRequired,
    onStyleChange: PropTypes.func.isRequired,
    openMeasurementDropdown: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = { 
      currScaleFrom: props.scale[0][0],
      currUnitFrom: props.scale[0][1],
      currScaleTo: props.scale[1][0],
      currUnitTo: props.scale[1][1],
      currPrecision: props.precision,
      isEditing: false };
  }

  componentDidUpdate(prevProps) {
    if (this.props.scale !== prevProps.scale) {
      this.setState((state, props) => ({
        currScaleFrom: props.scale[0][0],
        currUnitFrom: props.scale[0][1],
        currScaleTo: props.scale[1][0],
        currUnitTo: props.scale[1][1]
      }));
    }
    if (this.props.precision !== prevProps.precision) {
      this.setState((state, props) => ({
        currPrecision: props.precision
      }));
    }
  }

  onScaleChange = (value, type) => {
    this.setState({ [type]: Number(value) }, () => {
      this.props.onStyleChange('Scale', [
        [this.state.currScaleFrom, this.state.currUnitFrom],
        [this.state.currScaleTo, this.state.currUnitTo],
      ]);
    });
  }

  onPrecisionChange = (value, type) => {
    this.setState({ [type]: Number(value) }, () => {
      this.props.onStyleChange('Precision', this.state.currPrecision);
    });
  }

  onUnitChange = (event, type) => {
    this.setState({ [type]: event.target.value }, () => {
      this.props.onStyleChange('Scale', [
        [this.state.currScaleFrom, this.state.currUnitFrom],
        [this.state.currScaleTo, this.state.currUnitTo],
      ]);
    });
  }

  getLanguage = () => {
    let lang = 'en';

    if (i18next.language) {
      lang = i18next.language;
    }

    return lang;
  }

  formatValue = value => {
    const lang = this.getLanguage();
    
    if (lang === 'de') {
      value = value.toLocaleString('de-DE', { maximumFractionDigits: 4 });
    } else if (lang === 'fr') {
      value =  value.toLocaleString('fr-FR', { maximumFractionDigits: 4 });
    } else if (lang === 'ru') {
      value = value.toLocaleString('ru-RU', { maximumFractionDigits: 4 });
    }
    
    return value;
  }

  toggleEditing = () => {
    this.setState(state => ({ isEditing: !state.isEditing }));
  }

  render() {
    const {
      measurementUnits,
      t,
    } = this.props;
    const { from: unitFromOptions, to: unitToOptions } = measurementUnits;
    const precisionOptions = [
      { value: 0.1, name: '0.1' },
      { value: 0.01, name: '0.01' },
      { value: 0.001, name: '0.001' },
      { value: 0.0001, name: '0.0001' },
    ];

    return (
      <div
        className="MeasurementOption"
      >
        <div className="Scale">
          <div className="LayoutTitle">
            {t('option.measurementOption.scale')}
          </div>
          <div className="Layout">
            {this.state.isEditing ? (
              <input
                className="ScaleInput"
                type="number"
                step="any"
                value={this.state.currScaleFrom}
                onChange={e =>
                  this.onScaleChange(e.target.value, 'currScaleFrom')}
                onBlur={this.toggleEditing}
              />
            ) : (
              <input
                className="ScaleInput"
                type="text"
                value={this.formatValue(this.state.currScaleFrom)}
                onFocus={this.toggleEditing}
                readOnly
              />
            )}
            <select 
              className="UnitInput"
              value={this.state.currUnitFrom}
              onChange={event => this.onUnitChange(event,'currUnitFrom')}
            >{unitFromOptions.map(unit => {
                return <option key={unit} value={unit}>{unit}</option>;
              })}</select>
            <div className="ScaleEquals">=</div>
            {this.state.isEditing ? (
              <input
                className="ScaleInput"
                type="number"
                step="any"
                value={this.state.currScaleTo}
                onChange={e =>
                  this.onScaleChange(e.target.value, 'currScaleTo')}
                onBlur={this.toggleEditing}
              />
            ) : (
              <input
                className="ScaleInput"
                type="text"
                value={this.formatValue(this.state.currScaleTo)}
                onFocus={this.toggleEditing}
                readOnly
              />
            )}
            <select
              className="UnitInput"
              value={this.state.currUnitTo}
              onChange={event => this.onUnitChange(event,'currUnitTo')}
            >{unitToOptions.map(unit => {
                return <option key={unit} value={unit}>{unit}</option>;
              })}</select>
          </div>
        </div>
        <div className="Precision">
          <div className="LayoutTitlePrecision">{t('option.shared.precision')}</div>
          <div className="LayoutPrecision">
            <select
              className="PrecisionInput"
              value={this.state.currPrecision}
              onChange={e => this.onPrecisionChange(e.target.value, 'currPrecision')}
            >{precisionOptions.map(e => {
                return <option key={e.value} value={e.value}>{this.formatValue(e.value)}</option>;
              })}</select>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  measurementUnits: selectors.getMeasurementUnits(state),
});

export default connect(mapStateToProps)(withTranslation()(MeasurementOption));