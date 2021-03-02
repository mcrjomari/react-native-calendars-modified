import _ from 'lodash';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import React, {Component} from 'react';
import {FlatList, Platform, Dimensions, View} from 'react-native';
import {extractComponentProps} from '../component-updater';
import {xdateToData, parseDate} from '../interface';
import dateutils from '../dateutils';
import {STATIC_HEADER} from '../testIDs';
import styleConstructor from './style';
import Calendar from '../calendar';
import CalendarListItem from './item';
import CalendarHeader from '../calendar/header/index';
import moment from 'moment'
import changeTimezone from '../../../../App/Utils/changeTImeZone'


const {width} = Dimensions.get('window');

/**
 * @description: Calendar List component for both vertical and horizontal calendars
 * @extends: Calendar
 * @extendslink: docs/Calendar
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendarsList.js
 * @gif: https://github.com/wix/react-native-calendars/blob/master/demo/calendar-list.gif
 */
class CalendarList extends Component {
  static displayName = 'CalendarList';

  static propTypes = {
    ...Calendar.propTypes,
    /** Max amount of months allowed to scroll to the past. Default = 50 */
    pastScrollRange: PropTypes.number,
    /** Max amount of months allowed to scroll to the future. Default = 50 */
    futureScrollRange: PropTypes.number,
    /** Used when calendar scroll is horizontal, default is device width, pagination should be disabled */
    calendarWidth: PropTypes.number,
    /** Dynamic calendar height */
    calendarHeight: PropTypes.number,
    /** Style for the List item (the calendar) */
    calendarStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
    /** Whether to use static header that will not scroll with the list (horizontal only) */
    staticHeader: PropTypes.bool,
    /** Enable or disable vertical / horizontal scroll indicator. Default = false */
    showScrollIndicator: PropTypes.bool,

    /** Enable or disable scrolling of calendar list */
    scrollEnabled: PropTypes.bool,
    /** When true, the calendar list scrolls to top when the status bar is tapped. Default = true */
    scrollsToTop: PropTypes.bool,
    /** Enable or disable paging on scroll */
    pagingEnabled: PropTypes.bool,
    /** Whether the scroll is horizontal */
    horizontal: PropTypes.bool,
    /** Should Keyboard persist taps */
    keyboardShouldPersistTaps: PropTypes.oneOf(['never', 'always', 'handled']),
    /** A custom key extractor for the generated calendar months */
    keyExtractor: PropTypes.func,
    /** How far from the end to trigger the onEndReached callback */
    onEndReachedThreshold: PropTypes.number,
    /** Called once when the scroll position gets within onEndReachedThreshold */
    onEndReached: PropTypes.func
  };

  static defaultProps = {
    calendarWidth: width,
    calendarHeight: 350,
    pastScrollRange: 50,
    futureScrollRange: 50,
    showScrollIndicator: false,
    horizontal: false,
    scrollsToTop: false,
    scrollEnabled: true,
    removeClippedSubviews: Platform.OS === 'android',
    keyExtractor: (item, index) => String(index)
  };

  constructor(props) {
    super(props);

    this.style = styleConstructor(props.theme);

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20
    };

    const rows = [];
    const texts = [];
   const date = parseDate(props.current) || XDate();
  //   const nndate = date.toString("yyyy-MM-d")
  //   const mDate = moment(nndate).toDate()
  //   const isWhat = moment(mDate).diff(moment());

  //  let isDisplayNow = true
  //  let toCheck = null
  //  let dToDeduct = null
  //  let isId = null

  //   if(isWhat > 0){
  //     const nndateOrg = date.toString("yyyy-MM-d")
  //     const nndate1 =moment(nndateOrg).add(1,'months').toDate()
  //     const nndate2 =  moment(this.props.getNow.maxMax).toDate()

  //     const mnM = moment(nndate1).format('MMM YYYY')
  //     const nMn = moment(this.props.getNow.maxMax).format('MMM YYYY')
    
  //     toCheck = moment(this.props.getNow.maxMax).format('MMM YYYY')
  //     dToDeduct = this.props.getNow.maxMax
  //     isId = 'max'

      
  //     const isWhat2 = moment(nndate1).diff(moment(nndate2))
  //     console.log({nndate1,nndate2,mnM,nMn,isWhat2})
      
  //       //
  //       if(mnM == nMn){
  //         isDisplayNow=false
  //       }else{
  //         isDisplayNow=true
  //       }
      
    
  //   }else{
  //     const nndate1 = date.toString("yyyy-MM-d")
  //     const nndate2 =  moment(this.props.getNow.minMin)
  //     const mnM = moment(nndate1).format('MMM YYYY')
  //     const nMn = moment(this.props.getNow.minMin).format('MMM YYYY')

  //     toCheck =  moment(this.props.getNow.minMin).format('MMM YYYY')
  //     dToDeduct = this.props.getNow.minMin
  //     isId = 'min'
  //     const isWhat2 = moment(nndate1).diff(moment(nndate2))
  
     
  //     if(isWhat2 < 0){
  //       //
  //       if(mnM == nMn){
  //        // isDisplayNow = true
        
  //       }else{
  //         isDisplayNow=false
         
  //       }
      
  //     }else{
  //     isDisplayNow = true
  //   }
  //   }



  //   for (let i = 0; i <= props.pastScrollRange + props.futureScrollRange; i++) {
  //     const rangeDate = date.clone().addMonths(i - props.pastScrollRange, true);
  //     console.log({rangeDate},'huhu')
  //     const rangeDateStr = rangeDate.toString('MMM yyyy');
  //     const nndate3 = rangeDate.toString("yyyy-MM-d")
  //     const isWhat3 = moment(nndate3).diff(moment(dToDeduct)) 
     
  //     console.log({nndate3,dToDeduct,texts,rangeDateStr})
  //     if(isId === 'min'){
  //       if(isWhat3 < 0){
  //           if(rangeDateStr ===toCheck){
  //             texts.push(rangeDateStr);
  //           }
  //       }else{
  //         texts.push(rangeDateStr);
  //       }
  //     }else if(isId === 'max'){
  //       if(isWhat3 > 0){
  //           if(rangeDateStr ===toCheck){
  //             texts.push(rangeDateStr);
  //           }
  //       }else{
  //         texts.push(rangeDateStr);
  //       }
  //     }
  //     else{
  //       texts.push(rangeDateStr);
  //     }
     

    
  //     /*
  //      * This selects range around current shown month [-0, +2] or [-1, +1] month for detail calendar rendering.
  //      * If `this.pastScrollRange` is `undefined` it's equal to `false` or 0 in next condition.
  //      */
  //     if (
  //       (props.pastScrollRange - 1 <= i && i <= props.pastScrollRange + 1) ||
  //       (!props.pastScrollRange && i <= props.pastScrollRange + 2)
  //     ) {
  //       if(isDisplayNow){
  //         rows.push(rangeDate);
  //       }else{
  //         if(toCheck === rangeDateStr){
  //           rows.push(rangeDate);
  //         }else{
  //           if(isWhat3 < 0 && isId === 'min'){
  //             //
  //           }else if(isWhat3 > 0 && isId === 'max'){
  //             //
  //           }else{
  //             rows.push(rangeDate);
  //           }
  //         }
        
  //       }
        
  //     } else {
         
  //           rows.push(rangeDateStr);
          
  //     }
  //   }

   

  //   console.log({
  //     rows,
  //     texts,
  //     openDate: date,
  //     currentMonth: parseDate(props.current)
  //   })

  for (let i = 0; i <= props.pastScrollRange + props.futureScrollRange; i++) {
    const rangeDate = date.clone().addMonths(i - props.pastScrollRange, true);
    const rangeDateStr = rangeDate.toString('MMM yyyy');
    texts.push(rangeDateStr);
    /*
     * This selects range around current shown month [-0, +2] or [-1, +1] month for detail calendar rendering.
     * If `this.pastScrollRange` is `undefined` it's equal to `false` or 0 in next condition.
     */
    if (
      (props.pastScrollRange - 1 <= i && i <= props.pastScrollRange + 1) ||
      (!props.pastScrollRange && i <= props.pastScrollRange + 2)
    ) {
      rows.push(rangeDate);
    } else {
    rows.push(rangeDateStr);
    }
  }

    this.state = {
      rows,
      texts,
      openDate: date,
      currentMonth: parseDate(props.current)
    };
  }

  componentDidUpdate(prevProps) {
    const prevCurrent = parseDate(prevProps.current);
    const current = parseDate(this.props.current);

    if (current && prevCurrent && current.getTime() !== prevCurrent.getTime()) {
     
      this.scrollToMonth(current);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const rowclone = prevState.rows;
    const newrows = [];

    for (let i = 0; i < rowclone.length; i++) {
      let val = prevState.texts[i];
      if (rowclone[i].getTime) {
        val = rowclone[i].clone();
        val.propbump = rowclone[i].propbump ? rowclone[i].propbump + 1 : 1;
      }
      newrows.push(val);
    }

  
    return {rows: newrows};
  }

  scrollToDay(d, offset, animated) {
    const {horizontal, calendarHeight, calendarWidth, pastScrollRange, firstDay} = this.props;
    const day = parseDate(d);
    const diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(day.clone().setDate(1)));
    const size = horizontal ? calendarWidth : calendarHeight;
    let scrollAmount = size * pastScrollRange + diffMonths * size + (offset || 0);

    if (!horizontal) {
      let week = 0;
      const days = dateutils.page(day, firstDay);
      for (let i = 0; i < days.length; i++) {
        week = Math.floor(i / 7);
        if (dateutils.sameDate(days[i], day)) {
          scrollAmount += 46 * week;
          break;
        }
      }
    }
    this.listView.scrollToOffset({offset: scrollAmount, animated});
  }

  scrollToMonth = m => {
   
    const {horizontal, calendarHeight, calendarWidth, pastScrollRange} = this.props;
    const month = parseDate(m);

    const scrollTo = month || this.state.openDate;
    let diffMonths = Math.round(this.state.openDate.clone().setDate(1).diffMonths(scrollTo.clone().setDate(1)));
    const size = horizontal ? calendarWidth : calendarHeight;
    const scrollAmount = size * pastScrollRange + diffMonths * size;

    
    this.listView.scrollToOffset({offset: scrollAmount, animated: false});
  };

  getItemLayout = (data, index) => {
    const {horizontal, calendarHeight, calendarWidth} = this.props;

    return {
      length: horizontal ? calendarWidth : calendarHeight,
      offset: (horizontal ? calendarWidth : calendarHeight) * index,
      index
    };
  };

  getMonthIndex(month) {
    let diffMonths = this.state.openDate.diffMonths(month) + this.props.pastScrollRange;
    return diffMonths;
  }

  addMonth = count => {
   
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  };

  updateMonth(day, doNotTriggerListeners) {
 
    if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
      return;
    }

    this.setState(
      {
        currentMonth: day.clone()
      },
      () => {
        this.scrollToMonth(this.state.currentMonth);

        if (!doNotTriggerListeners) {
          const currMont = this.state.currentMonth.clone();

          _.invoke(this.props, 'onMonthChange', xdateToData(currMont));
          _.invoke(this.props, 'onVisibleMonthsChange', [xdateToData(currMont)]);
        }
      }
    );
  }

  onViewableItemsChanged = ({viewableItems}) => {
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const rowclone = this.state.rows;
    const newrows = [];
    const visibleMonths = [];

    for (let i = 0; i < rowclone.length; i++) {
      let val = rowclone[i];
      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);

      if (rowShouldBeRendered && !rowclone[i].getTime) {
        val = this.state.openDate.clone().addMonths(i - this.props.pastScrollRange, true);
      } else if (!rowShouldBeRendered) {
        val = this.state.texts[i];
      }
      newrows.push(val);
      if (rowIsCloseToViewable(i, 0)) {
        visibleMonths.push(xdateToData(val));
      }
    }

    _.invoke(this.props, 'onVisibleMonthsChange', visibleMonths);

    

    this.setState({
      rows: newrows,
      currentMonth: parseDate(visibleMonths[0])
    });


    if(visibleMonths[0].dateString!==this.props.selDate){
      const isWhat = moment(visibleMonths[0].dateString).diff(moment(this.props.getNow.monthStartDate));

     
      if (isWhat > 0) {
        let newMonth = this.props.getNow;
        const fromWhat = moment(this.props.getNow.monthStartDate)
          .add(1, 'months')
          .format('YYYY-MM-DD');
        const toWhat = moment(this.props.getNow.monthEndDate)
          .add(1, 'months')
          .clone()
          .endOf('month')
          .format('YYYY-MM-DD');
        const lastFwhat = fromWhat.split('-');
        const lst = `${lastFwhat[0]}-${lastFwhat[1]}-01`;
        newMonth = {
          ...this.props.getNow,
          monthStartDate: lst,
          monthEndDate: toWhat
        };

       
  
    
        this.props.setNow(newMonth);
        const newMM = moment(lst).format('MMM YYYY');
        this.props.setCurrMM(newMM);
        //this.props.reloadToday()
        this.props.setSelDate(lst);
      } else {
        if (isWhat !== 0) {
          let newMonth = this.props.getNow;
          const fromWhat = moment(this.props.getNow.monthStartDate)
            .subtract(1, 'months')
            .format('YYYY-MM-DD');
          const lastFwhat = fromWhat.split('-');
          const lst = `${lastFwhat[0]}-${lastFwhat[1]}-01`;
  
          const toWhat = moment(this.props.getNow.monthEndDate)
            .subtract(1, 'months')
            .clone()
            .endOf('month')
            .format('YYYY-MM-DD');
          newMonth = {
            ...this.props.getNow,
            monthStartDate: lst,
            monthEndDate: toWhat
          };
        
          
          this.props.setNow(newMonth);
          const newMM = moment(lst).format('MMM YYYY');
          this.props.setCurrMM(newMM);
         this.props.setSelDate(lst);

       //  this.props.reloadToday()
        }
      }
    }

   
   
  };

  renderItem = ({item}) => {
    const {setSelDate,reloadToday, getNow,tz,calendarStyle, horizontal, calendarWidth, testID, ...others} = this.props;
    return (
      <CalendarListItem
        {...others}
        item={item}
        testID={`${testID}_${item}`}
        style={calendarStyle}
        calendarWidth={horizontal ? calendarWidth : undefined}
        scrollToMonth={this.scrollToMonth}
        tz={tz}
        getNow={getNow}
        reloadToday={reloadToday}
        setSelDate={setSelDate}
      />
    );
  };

  renderStaticHeader() {
    const {setListLoading,chkProv,setArrangeData,nav,tz,setSelDate,getNow, reloadToday,setNow,getNowOrig, staticHeader, horizontal, headerStyle,calProv,current, isTodayActive} = this.props;
    const useStaticHeader = staticHeader && horizontal;
    const headerProps = extractComponentProps(CalendarHeader, this.props);

    if (useStaticHeader) {
      return (
        <CalendarHeader
          {...headerProps}
          testID={STATIC_HEADER}
          style={[this.style.staticHeader, headerStyle]}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          accessibilityElementsHidden={true} // iOS
          importantForAccessibility={'no-hide-descendants'} // Android
          calProv={calProv}
          currMo={current}
          isTodayActive={isTodayActive}
          setNow={setNow}
          getNowOrig={getNowOrig}
          reloadToday={reloadToday}
          getNow={getNow}
          setSelDate={setSelDate}
          tz={tz}
          nav={nav}
          setArrangeData={setArrangeData}
          chkProv={chkProv}
          setListLoading={setListLoading}
        />
      );
    }
  }

  render() {
    const {style, pastScrollRange, futureScrollRange, horizontal, showScrollIndicator, testID} = this.props;
   
    return (
      <View>
        <FlatList
          ref={c => (this.listView = c)}
          style={[this.style.container, style]}
          initialListSize={pastScrollRange + futureScrollRange + 1} // ListView deprecated
          data={this.state.rows}
          renderItem={this.renderItem}
          getItemLayout={this.getItemLayout}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={this.viewabilityConfig}
          initialScrollIndex={this.state.openDate ? this.getMonthIndex(this.state.openDate) : false}
          showsVerticalScrollIndicator={showScrollIndicator}
          showsHorizontalScrollIndicator={horizontal && showScrollIndicator}
          testID={testID}
          onLayout={this.props.onLayout}
          removeClippedSubviews={this.props.removeClippedSubviews}
          pagingEnabled={this.props.pagingEnabled}
          scrollEnabled={true}
          scrollsToTop={this.props.scrollsToTop}
          horizontal={this.props.horizontal}
          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}
          keyExtractor={this.props.keyExtractor}
          onEndReachedThreshold={this.props.onEndReachedThreshold}
          onEndReached={this.props.onEndReached}
        />
        {this.renderStaticHeader()}
      </View>
    );
  }
}

export default CalendarList;
