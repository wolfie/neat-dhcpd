import pton4B from "./pton4B";

const pton4I = (str: `${number}.${number}.${number}.${number}`) =>
  pton4B(str).readUint32BE();

export default pton4I;
