import { StyleSheet } from "react-native";
import { ApplicationStyles, Metrics, Colors, Fonts } from "../../Themes";

export default StyleSheet.create({
  container: {
    marginVertical: Metrics.tinyMargin,
    backgroundColor: Colors.cloud,
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  checkbox: {
    width: Metrics.controls.checkBoxSize,
    height: Metrics.controls.checkBoxSize
  },
  checkBoxUnchecked: {
    borderColor: Colors.snow,
    borderWidth: Metrics.controls.checkBoxBorderWidth
  },
  checkBoxChecked: {
    backgroundColor: Colors.fire
  }
});
