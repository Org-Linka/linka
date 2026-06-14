import type {
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

export interface SearchBarProps
  extends Omit<
    TextInputProps,
    "defaultValue" | "onBlur" | "onChangeText" | "onFocus" | "style" | "value"
  > {
  /**
   * Placeholder text for the search input
   * @default "Search..."
   */
  placeholder?: string;
  /**
   * Callback when search text changes
   */
  onSearch?: (query: string) => void;
  /**
   * Callback when search is cleared
   */
  onClear?: () => void;
  /**
   * Additional style for the container
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the input
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Tint color for the search
   */
  tint?: string;

  renderTrailingIcons?: () => React.ReactNode;
  renderLeadingIcons?: () => React.ReactNode;
  onSearchDone?: () => void;
  onSearchMount?: () => void;
  containerWidth?: number;
  focusedWidth?: number;
  cancelButtonWidth?: number;
  iconStyle?: StyleProp<ViewStyle>;
  enableWidthAnimation?: boolean;
  centerWhenUnfocused?: boolean;
  textCenterOffset?: number;
  iconCenterOffset?: number;
}
