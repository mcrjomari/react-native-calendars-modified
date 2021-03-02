import {StyleSheet, Platform} from 'react-native';
import * as defaultStyle from '../../style';

const STYLESHEET_ID = 'stylesheet.calendar.header';
import DeviceInfo from 'react-native-device-info';


export default function (theme = {}) {
  const isLowPhone =
  Number(
    DeviceInfo.getDeviceId()
      .replace('iPhone', '')
      .replace(',', '.')
  ) < 10
    ? true
    : false;
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingLeft: 10,
      paddingRight: 10,
      marginTop:isLowPhone?0: 6,
      alignItems: 'center'
    },
    headerContainer: {
      flexDirection: 'row'
    },
    monthText: {
      fontSize: appStyle.textMonthFontSize,
      fontFamily: appStyle.textMonthFontFamily,
      fontWeight: appStyle.textMonthFontWeight,
      color: appStyle.monthTextColor,
      margin: 10
    },
    arrow: {
      padding: 10,
      ...appStyle.arrowStyle
    },
    arrowImage: {
      tintColor: appStyle.arrowColor,
      ...Platform.select({
        web: {
          width: appStyle.arrowWidth,
          height: appStyle.arrowHeight
        }
      })
    },
    disabledArrowImage: {
      tintColor: appStyle.disabledArrowColor
    },
    week: {
      marginTop: 7,
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: isLowPhone?0: 7,
      width: 32,
      textAlign: 'center',
      fontSize: appStyle.textDayHeaderFontSize,
      fontFamily: appStyle.textDayHeaderFontFamily,
      fontWeight: appStyle.textDayHeaderFontWeight,
      color: appStyle.textSectionTitleColor
    },
    disabledDayHeader: {
      color: appStyle.textSectionTitleDisabledColor
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}
