import _ from 'lodash';
import React, {Component} from 'react';
import {Typography,Modal} from '../../../../App/Components'
import {SectionList, Text,View,ActivityIndicator,PixelRatio} from 'react-native';
import PropTypes from 'prop-types';
import XDate from 'xdate';
import moment from 'moment';
import styleConstructor from './style';
import asCalendarConsumer from './asCalendarConsumer';
import Theme from '../../../../App/Theme';
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'

const commons = require('./commons');
const UPDATE_SOURCES = commons.UPDATE_SOURCES;

/**
 * @description: AgendaList component
 * @note: Should be wrapped with 'CalendarProvider'
 * @extends: SectionList
 * @example: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/expandableCalendar.js
 */
class AgendaList extends Component {
  static displayName = 'AgendaList';

  static propTypes = {
    ...SectionList.propTypes,
    /** day format in section title. Formatting values: http://arshaw.com/xdate/#Formatting */
    dayFormat: PropTypes.string,
    /** a function to custom format the section header's title */
    dayFormatter: PropTypes.func,
    /** whether to use moment.js for date string formatting 
     * (remember to pass 'dayFormat' with appropriate format, like 'dddd, MMM D') */
    useMoment: PropTypes.bool,
    /** whether to mark today's title with the "Today, ..." string. Default = true */
    markToday: PropTypes.bool,
    /** style passed to the section view */
    sectionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array])
  }

  static defaultProps = {
    dayFormat: 'dddd, MMM d',
    stickySectionHeadersEnabled: true,
    markToday: true
  }

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);

    this._topSection = _.get(props, 'sections[0].title');
    this.didScroll = false;
    this.sectionScroll = false;
    this.scrollIsDrag = false;

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20 // 50 means if 50% of the item is visible
    };
    this.list = React.createRef();
    this.onLastItem = false
    this.onEndReachedCalledDuringMomentum = true;
    this.prevItem = null
    this.mom = false
    this.lastIndex = null
    this.scrollState = false
    this.currProcess = null
    this.getItemLayout = sectionListGetItemLayout({
      // The height of the row with rowData at the given sectionIndex and rowIndex 62.89
      getItemHeight: (rowData, sectionIndex, rowIndex) =>  65,
      // {
      // const evDd =  moment(rowData.eventDate).format('YYYY-MM-DD')
      // const currDD = moment.utc(moment.tz(this.props.tz)).format('YYYY-MM-DD')
      //   return 62.89
      // },
 
      // These four properties are optional
      getSeparatorHeight: () => 1 / PixelRatio.get(), // The height of your separators
      getSectionHeaderHeight: () => 0, // The height of your section headers
      getSectionFooterHeight: () => 0, // The height of your section footers
      listHeaderHeight: 0, // The height of your list header
    })
  }

  getSectionIndex(date) {
    
    let i;
    let nearestDate;
    _.forEach(this.props.sections, (section, index) => {
      // NOTE: sections titles should match current date format!!!
      
      if (section.title === date) {
        i = index;
        return false;
      } else {
      let diff = moment(section.title).diff(moment(date), 'days');
        if (diff > 0) {
          if (nearestDate) {
            if (moment(section.title).diff(moment(nearestDate), 'days') < 0) {
            nearestDate = section.title;
              i = index
              return false;
            }
      } else {
      nearestDate = section.title;
      i = index
      return false;
    }
  }
      }
    });
  return i;
  }

  componentDidMount() {
    const {date,sections} = this.props.context;
  
    const tm = this.props.sections.length * 20
    if (date !== this._topSection) {
      setTimeout(() => {
        const sectionIndex = this.getSectionIndex(date);
        this.lastIndex = sectionIndex
        // console.log('fitouohhaha')
        this.scrollToSection(sectionIndex);
      }, tm);
    }
  }

  componentDidUpdate(prevProps) {
    const {updateSource, date} = this.props.context;
    if (date !== prevProps.context.date) {
      // NOTE: on first init data should set first section to the current date!!!
      if (updateSource !== UPDATE_SOURCES.LIST_DRAG && updateSource !== UPDATE_SOURCES.CALENDAR_INIT) {
        const sectionIndex = this.getSectionIndex(date);
          this.lastIndex = sectionIndex
          this.scrollToSection(sectionIndex,date);
          
         
          
        
          
           
      }
    }
  }

  scrollToSection(sectionIndex,date) {
  
    if (this.list.current && sectionIndex !== undefined && this.props.sections[sectionIndex]!==undefined) {
      this.currProcess = sectionIndex
      this.sectionScroll = true; // to avoid setDate() in onViewableItemsChanged
      // console.log(this._topSection,'jehjeheh',this.props.sections[sectionIndex],this.props.sections)
      this._topSection = this.props.sections[sectionIndex].title;
      
      
      this.list.current.scrollToLocation({
        animated: false,
        sectionIndex: sectionIndex,
        itemIndex: 0,
        viewPosition: 0, // position at the top
        viewOffset: commons.isAndroid ? this.sectionHeight: 0
      })
    
    }
    
   
  }

  onViewableItemsChanged = ({viewableItems}) => {

    // alert(`${Object.keys(viewableItems).length} : ${this.sectionScroll}`);
    // && !this.sectionScroll
    if (viewableItems && this.scrollIsDrag) {
      const topSection = _.get(viewableItems[0], 'section.title');
      if (topSection && topSection !== this._topSection) {
        this._topSection = topSection;
        //baguhin mo to
        // console.log({topSection,viewableItems})

       // this.props.setHidemySection(topSection)
        if (this.didScroll) { // to avoid setDate() on first load (while setting the initial context.date value)
          _.invoke(this.props.context, 'setDate', this._topSection, UPDATE_SOURCES.LIST_DRAG);
        }
      }else{
       // this.props.setHidemySection(topSection)
      }
    }
  }



  onScroll = (event) => {
   const vbmnnn = event.nativeEvent.contentOffset.y
   if(vbmnnn < 0){
     this.props.setDirectionScroll('up')
   }else{
    this.props.setDirectionScroll('down')
   }

    if (!this.didScroll) {
      this.didScroll = true;
    }
    _.invoke(this.props, 'onScroll', event);

    if(!this._topSection) return false;
    _.invoke(this.props, 'onAgendaChangeDate', this.sectionScroll);
  }

  onMomentumScrollBegin = (event) => {
    // this.sectionScroll = true;
    this.onEndReachedCalledDuringMomentum = false;
    _.invoke(this.props.context, 'setDisabled', true);
    _.invoke(this.props, 'onMomentumScrollBegin', event);

  // this.mom = true

   
  }

  onMomentumScrollEnd = (event) => {
    // when list momentum ends AND when scrollToSection scroll ends
   
    
    this.sectionScroll = false;
    _.invoke(this.props.context, 'setDisabled', false);
    _.invoke(this.props, 'onMomentumScrollEnd', event);


  }

  onScrollBeginDrag = (event) => {
    if(!this.scrollIsDrag) this.scrollIsDrag = true;
    _.invoke(this.props, 'onScrollBeginDragEvent', event);
  }

  onScrollEndDrag = (event) => {
    if(this.scrollIsDrag) this.scrollIsDrag = false;
    _.invoke(this.props, 'onScrollEndDragEvent', event);
  }

  onHeaderLayout = ({nativeEvent}) => {
    this.sectionHeight = nativeEvent.layout.height;
  }

  renderSectionHeader = ({section: {title,data,index}}) => {
    const {renderSectionHeader, dayFormatter, dayFormat, useMoment, markToday, sectionStyle,sections} = this.props;
   

    if (renderSectionHeader) {
      return renderSectionHeader(title);
    }

    let sectionTitle = title;

    if (dayFormatter) {
      sectionTitle = dayFormatter(title);
    } else if (dayFormat) {
      if (useMoment) {
        sectionTitle = moment(title).format(dayFormat);
      } else {
        sectionTitle = XDate(title).toString(dayFormat);
      }
    }

    if (markToday) {
      const todayString = XDate.locales[XDate.defaultLocale].today || commons.todayString;
      const today = XDate().toString("yyyy-MM-d");
      sectionTitle = title === today ? `${todayString}, ${sectionTitle}` : sectionTitle;
    }

    return (
      <Text 
        allowFontScaling={false} 
        style={[this.style.sectionText, sectionStyle]} 
        onLayout={this.onHeaderLayout}
      >
        {sectionTitle}
      </Text>
    );
  }

  keyExtractor = (item, index) => {
    const {keyExtractor} = this.props;
    return _.isFunction(keyExtractor) ? keyExtractor(item, index) : String(index);
  }


  render() {
    const {currMM,getNow,context,selDate,setListLoading} = this.props;

    const isMin = moment(getNow.minMin).subtract(1,'months').format('YYYY-MM-DD')
    const isMax = getNow.maxMax

    const withinRange = moment(selDate).isBetween(isMin,isMax)

    

    return (
      <View style={{flex:1}}>
        <View style={{ backgroundColor: '#E7E9EA', padding: 10 }}>
        <Typography>
          {currMM}
        </Typography>
      </View>

  <SectionList
  {...this.props}
  ref={this.list}
  getItemLayout={this.getItemLayout}
  initialNumToRender={this.props.sections.length > 50 ? 50: this.props.sections.length }
  maxToRenderPerBatch={50}
  windowSize={41}
  keyExtractor={this.keyExtractor}
  showsVerticalScrollIndicator={false}
  onViewableItemsChanged={this.onViewableItemsChanged}
  viewabilityConfig={this.viewabilityConfig}
  renderSectionHeader={this.renderSectionHeader}
  onScroll={this.onScroll}
  onMomentumScrollBegin={this.onMomentumScrollBegin}
  onMomentumScrollEnd={this.onMomentumScrollEnd}
  onScrollBeginDrag={this.onScrollBeginDrag}
  onScrollEndDrag={this.onScrollEndDrag}
  ListEmptyComponent={
    <View style={{ padding: 10 }}>
    <Typography variant='h1' textAlign='center' style={{fontWeight:'normal'}} color={Theme.Gray6} >
   {withinRange? 'No events for this month':'Semester/Term has not been activated'}
    </Typography>
  </View>
  }
 onScrollToIndexFailed={(error) => {
  //  alert(JSON.stringify(error));
    setTimeout(() => {
      if (this.props.sections.length !== 0 && this.list.current) {
        // this.list.current.scrollToLocation({
        //   animated: false,
        //   sectionIndex: this.lastIndex,
        //   itemIndex: 0,
        //   viewPosition: 0, // position at the top
        //   viewOffset: commons.isAndroid ? this.sectionHeight : 0 
        // });
        this.scrollToSection(this.lastIndex);
        // this.list.current.scrollToLocation({
        //     animated: false,
        //     itemIndex: -1,
        //     sectionIndex: this.lastIndex,
        //     viewPosition: 0,
        //     viewOffset: commons.isAndroid ? this.sectionHeight : 0 
        // });
       
      //   const thisInd = this.props.sections.length -1 
      //   const thisInd2 = thisInd/2
      //   const thisFInal = Number(thisInd2)
      //   const vv = thisFInal.toFixed(0)
      //   const tt = Number(vv)
      //   console.log({tt,error,thisInd,thisFInal,vv})

      // // this.scrollToSection(tt)
      //   this.list.current.scrollToLocation({
      //     animated: false,
      //     sectionIndex: tt,
      //     itemIndex: 0,
      //     viewPosition: 0, // position at the top
      //     viewOffset: commons.isAndroid ? this.sectionHeight : 0
      //   });

        
      //   setTimeout(()=>{
      //     this.scrollToSection(this.lastIndex)
      //   },500)
        
      }
    }, 500);
  }}
  //getItemLayout={this.getItemLayout}
  // onEndReached={this.onEndReached.bind(this)}
  // getItemLayout={this.getItemLayout} // onViewableItemsChanged is not updated when list scrolls!!!
  // getItemLayout={(data, index) => ({
  //     length: 44.5,
  //     offset: 44.5 * index,
  //     index
  //   })}
/>
       </View>
    );
  }

  // getItemLayout = (data, index) => {
  //   return {length: commons.screenWidth, offset: commons.screenWidth  * index, index};
  // }
}

export default asCalendarConsumer(AgendaList);
