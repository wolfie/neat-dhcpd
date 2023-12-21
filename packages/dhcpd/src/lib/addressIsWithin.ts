import pton4I from "./pton4I";

const addressIsWithin = (
  minIp: `${number}.${number}.${number}.${number}`,
  maxIp: `${number}.${number}.${number}.${number}`
) => {
  const minN = pton4I(minIp);
  const maxN = pton4I(maxIp);

  return (ip: `${number}.${number}.${number}.${number}`) => {
    const ipN = pton4I(ip);
    return minN <= ipN && ipN <= maxN;
  };
};

export default addressIsWithin;
