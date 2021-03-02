import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component, Fragment} from 'react';
import {ActivityIndicator, Platform, View, Text, TouchableOpacity, Image} from 'react-native';
import {shouldUpdate} from '../../component-updater';
import {weekDayNames,sameDate} from '../../dateutils';
import {
  CHANGE_MONTH_LEFT_ARROW,
  CHANGE_MONTH_RIGHT_ARROW,
  HEADER_DAY_NAMES,
  HEADER_LOADING_INDICATOR,
  HEADER_MONTH_NAME
} from '../../testIDs';
import styleConstructor from './style';
import {Typography} from '../../../../../App/Components/'
import moment from 'moment'
import Theme from '../../../../../App/Theme'
import changeTimezone from '../../../../../App/Utils/changeTImeZone'


class CalendarHeader extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    theme: PropTypes.object,
    firstDay: PropTypes.number,
    displayLoadingIndicator: PropTypes.bool,
    showWeekNumbers: PropTypes.bool,
    month: PropTypes.instanceOf(XDate),
    addMonth: PropTypes.func,
    /** Month format in the title. Formatting values: http://arshaw.com/xdate/#Formatting */
    monthFormat: PropTypes.string,
    /**  Hide day names. Default = false */
    hideDayNames: PropTypes.bool,
    /** Hide month navigation arrows. Default = false */
    hideArrows: PropTypes.bool,
    /** Replace default arrows with custom ones (direction can be 'left' or 'right') */
    renderArrow: PropTypes.func,
    /** Handler which gets executed when press arrow icon left. It receive a callback can go back month */
    onPressArrowLeft: PropTypes.func,
    /** Handler which gets executed when press arrow icon right. It receive a callback can go next month */
    onPressArrowRight: PropTypes.func,
    /** Disable left arrow. Default = false */
    disableArrowLeft: PropTypes.bool,
    /** Disable right arrow. Default = false */
    disableArrowRight: PropTypes.bool,
    /** Apply custom disable color to selected day indexes */
    disabledDaysIndexes: PropTypes.arrayOf(PropTypes.number),
    /** Replace default month and year title with custom one. the function receive a date as parameter. */
    renderHeader: PropTypes.any,
    /** Provide aria-level for calendar heading for proper accessibility when used with web (react-native-web) */
    webAriaLevel: PropTypes.number
  };

  static defaultProps = {
    monthFormat: 'MMMM yyyy',
    webAriaLevel: 1
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

  shouldComponentUpdate(nextProps) {
   
    if (nextProps.month.toString('yyyy MM') !== this.props.month.toString('yyyy MM')) {
      return true;
    }
    
    
    return shouldUpdate(this.props, nextProps, [
      'displayLoadingIndicator',
      'hideDayNames',
      'firstDay',
      'showWeekNumbers',
      'monthFormat',
      'renderArrow',
      'disableArrowLeft',
      'disableArrowRight',
      'isTodayActive'
    ]);
  }

  addMonth = () => {
    const {addMonth} = this.props;
   const tr = addMonth(1);
    return tr
  };

  subtractMonth = () => {
    const {addMonth} = this.props;
    addMonth(-1);
    
  };

  runLeft = ()=>{
    const {reloadToday} = this.props;
   reloadToday();
  }

  onPressLeft = () => {
    const {onPressArrowLeft, month,getNow,setNow,reloadToday,calProv,setSelDate} = this.props;
    

    this.runLeft()
    if (typeof onPressArrowLeft === 'function') {
      return onPressArrowLeft(this.subtractMonth, month);
    }
    return this.subtractMonth();
   
  };
  

  onPressRight = () => {
    const {onPressArrowRight, month,getNow} = this.props;   
    
    
      this.runMe()
    
    if (typeof onPressArrowRight === 'function') {
     
      return onPressArrowRight(this.addMonth, month);
     
      }
  
    return this.addMonth();

    
  };

  renderWeekDays = weekDaysNames => {
    const {disabledDaysIndexes} = this.props;

    return weekDaysNames.map((day, idx) => {
      const dayStyle = [this.style.dayHeader];

      if (_.includes(disabledDaysIndexes, idx)) {
        dayStyle.push(this.style.disabledDayHeader);
      }

      return (
        <Text allowFontScaling={false} key={idx} style={dayStyle} numberOfLines={1} accessibilityLabel={''}>
          {day}
        </Text>
      );
    });
  };

  renderHeader = () => {
    const {renderHeader, month, monthFormat, testID, webAriaLevel} = this.props;
    const webProps = Platform.OS === 'web' ? {'aria-level': webAriaLevel} : {};

    if (renderHeader) {
      return renderHeader(month);
    }

    return (
      <Fragment>
        <Text
          allowFontScaling={false}
          style={this.style.monthText}
          testID={testID ? `${HEADER_MONTH_NAME}-${testID}` : HEADER_MONTH_NAME}
          {...webProps}
        >
          {month.toString(monthFormat)}
        </Text>
      </Fragment>
    );
  };

   runMe =()=>{
    const {reloadToday} = this.props;
      reloadToday()
   }

   

  renderArrow(direction) {
    const {hideArrows, disableArrowLeft, disableArrowRight, renderArrow, testID,month,getNow,setNow,reloadToday,monthFormat} = this.props;
    if (hideArrows) {
      return <View />;
    }
    const isLeft = direction === 'left';
    const id = isLeft ? CHANGE_MONTH_LEFT_ARROW : CHANGE_MONTH_RIGHT_ARROW;
    const testId = testID ? `${id}-${testID}` : id;
    const onPress = isLeft ? this.onPressLeft : this.onPressRight;
    const imageSource = isLeft ? require('../img/previous.png') : require('../img/next.png');
    const renderArrowDirection = isLeft ? 'left' : 'right';
    const shouldDisable = isLeft ? disableArrowLeft : disableArrowRight;

    return (
      <TouchableOpacity
        onPress={!shouldDisable ? onPress : undefined}
        disabled={shouldDisable}
        style={this.style.arrow}
        hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        testID={testId}
      >
        {renderArrow ? (
          renderArrow(renderArrowDirection)
        ) : (
          <Image source={imageSource} style={shouldDisable ? this.style.disabledArrowImage : this.style.arrowImage} />
        )}
      </TouchableOpacity>
    );
  }

  renderIndicator() {
    const {displayLoadingIndicator, theme, testID} = this.props;

    if (displayLoadingIndicator) {
      return (
        <ActivityIndicator
          color={theme && theme.indicatorColor}
          testID={testID ? `${HEADER_LOADING_INDICATOR}-${testID}` : HEADER_LOADING_INDICATOR}
        />
      );
    }
  }

  renderDayNames() {
    const {firstDay, hideDayNames, showWeekNumbers, testID} = this.props;
    const weekDaysNames = weekDayNames(firstDay);

    if (!hideDayNames) {
      return (
        <View style={this.style.week} testID={testID ? `${HEADER_DAY_NAMES}-${testID}` : HEADER_DAY_NAMES}>
          {showWeekNumbers && <Text allowFontScaling={false} style={this.style.dayHeader}></Text>}
          {this.renderWeekDays(weekDaysNames)}
        </View>
      );
    }
  }

  renderTodayMe(){

    const {setListLoading,getNowOrig,setNow,reloadToday,calProv,setArrangeData,setSelDate,tz,getNow,month} = this.props;
    return(
      <TouchableOpacity
      style={{
        position: 'absolute',
        left: 0,
        backgroundColor: this.props.isTodayActive == false ? Theme.Gray5  : '#80B0AD',
        borderRadius: 5
      }}
      disabled={ this.props.isTodayActive == false?true:false}
      onPress={async() => {
        setListLoading(true)
        setNow(getNowOrig);
        reloadToday()
        const mmMo = moment(getNow.monthStartDate).format('MMM YYYY')
        const oooMM = moment(month).format('MMM YYYY')

        console.log({mmMo,oooMM,setListLoading})
        // setTimeout(()=>{
        //   calProv.current.onTodayPress()
        // },1200)
        if(mmMo === oooMM){

         
          //
         
          setTimeout(()=>{
           // 
           calProv.current.onTodayPress()
           // calProv.current.onTodayPress()
            setTimeout(()=>{
            //  calProv.current.onTodayPress()
              setListLoading(false)
            },300)
          },150)
        
            // setTimeout(()=>{
            //   calProv.current.onTodayPress()
            //   setTimeout(()=>{
            //     setListLoading(false)
            //   },150)
            // },600)
           
            // console.log('dito')

            

            
        
        }else{

          if(Platform.OS === 'android'){
           // alert('dito')
            setTimeout(()=>{
              setSelDate(getNow.monthStartDate);
              
            
           
            calProv.current.onTodayPress()
            setTimeout(()=>{
              setSelDate(moment.utc(moment.tz(tz)).format('YYYY-MM-DD'))
             calProv.current.onTodayPress()
              setTimeout(()=>{
                calProv.current.onTodayPress()

                setTimeout(()=>{
                  setListLoading(false)
                },500)
              
              },400)
            
            },300)
          },800)
          }else{
            //setSelDate(moment.utc(moment.tz(tz)).format('YYYY-MM-DD'))
            setTimeout(()=>{
         
              setSelDate(moment.utc(moment.tz(tz)).format('YYYY-MM-DD'))
            
           
            calProv.current.onTodayPress()
            setTimeout(()=>{
          // calProv.current.onTodayPress()
              setTimeout(()=>{
                setListLoading(false)
              },500)
            
            },400)
          },1000)
          }
         
        }
      
      
      
      
    
      }}
    >
      <Typography
        style={{ padding: 7 }}
        color={'#fff'}
      >
        Today
      </Typography>
    </TouchableOpacity>
    )
  }
  

  render() {
    const {style, testID} = this.props;

    return (
      <View
        testID={testID}
        style={style}
        accessible
        accessibilityRole={'adjustable'}
        accessibilityActions={[
          {name: 'increment', label: 'increment'},
          {name: 'decrement', label: 'decrement'}
        ]}
        onAccessibilityAction={this.onAccessibilityAction}
        accessibilityElementsHidden={this.props.accessibilityElementsHidden} // iOS
        importantForAccessibility={this.props.importantForAccessibility} // Android
      >
        <View style={this.style.header}>
           {this.renderTodayMe()}
          {this.renderArrow('left')}
          <View style={this.style.headerContainer}>
            {this.renderHeader()}
            {this.renderIndicator()}
          </View>
          {this.renderArrow('right')}
        </View>
        {this.renderDayNames()}
      </View>
    );
  }

  onAccessibilityAction = event => {
    switch (event.nativeEvent.actionName) {
      case 'decrement':
        this.onPressLeft();
        break;
      case 'increment':
        this.onPressRight();
        break;
      default:
        break;
    }
  };
}

export default CalendarHeader;
