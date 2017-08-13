/*
 * @Author: mwk 
 * @Date: 2017-08-11 23:47:50 
 * @Last Modified by: mwk
 * @Last Modified time: 2017-08-13 21:48:24
 */
import React, { Component } from "react";
import { View, Text, ListView } from "react-native";
import { connect } from "react-redux";
import I18n from "react-native-i18n";
import styles from "./Styles/StockPickerScreenStyle";
import StockCell from "../Components/StockCell";
import LoadingIndicator from "../Components/LoadingIndicator";
import AnalyticsActions from "../Redux/AnalyticsRedux";

class StockPickerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  updateStocks() {
    const rowHasChanged = (r1, r2) => r1.stockSymbol !== r2.stockSymbol;
    const ds = new ListView.DataSource({ rowHasChanged });
    this.setState(prevState => ({
      dataSource: ds.cloneWithRows(this.props.stocks)
    }));
  }

  showStockDetails(stock) {
    this.props.getStockDetails(stock);
    const { navigate } = this.props.navigation;
    navigate("StockDetailsScreen");
  }

  renderRow(rowData) {
    // https://github.com/facebook/react-native/issues/7233
    return (
      <StockCell
        symbol={rowData.stockSymbol}
        name={rowData.stockName}
        pe={rowData.currentPE}
        onSelectStock={() => this.showStockDetails(rowData)}
      />
    );
  }

  getStocks = async () => {
    this.props.getStocks(this.props.market);
  };

  componentDidMount(){
    this.getStocks();
  }

  componentWillMount() {
    this.updateStocks();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.stocks) {
      this.setState(prevState => ({
        dataSource: prevState.dataSource.cloneWithRows(newProps.stocks)
      }));
    }
  }

  // Used for friendly AlertMessage
  // returns true if the dataSource is empty
  noRowData() {
    return this.state.dataSource.getRowCount() === 0;
  }

  // Render a footer.
  renderFooter = () => {
    return (
      <Text>
        {" "}- {this.props.market} -{" "}
      </Text>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <LoadingIndicator show={this.props.loading} />
        <ListView
          contentContainerStyle={styles.listContent}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}
          renderFooter={this.renderFooter}
          enableEmptySections
          pageSize={15}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    stocks: state.analytics.stocks,
    market: state.analytics.selectedMarket,
    loading: state.analytics.fetching
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getStocks: selectedMarket =>
      dispatch(AnalyticsActions.getStocksRequest(selectedMarket)),
    getStockDetails: selectedStock =>
      dispatch(AnalyticsActions.getStockDetailsRequest(selectedStock))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StockPickerScreen);
