import React from 'react';

const IconLoading: React.FC<IICon> = prop => {
  const { color, height = 48, width = 48 } = prop;

  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 24 30"
      xmlSpace="preserve"
    >
      <rect
        x="0"
        y="0"
        width="4"
        height="10"
        fill={color}
        transform="translate(0 15.1665)"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0"
          dur="1s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
      <rect
        x="10"
        y="0"
        width="4"
        height="10"
        fill={color}
        transform="translate(0 11.5002)"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.33s"
          dur="1s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
      <rect
        x="20"
        y="0"
        width="4"
        height="10"
        fill={color}
        transform="translate(0 1.83315)"
      >
        <animateTransform
          attributeType="xml"
          attributeName="transform"
          type="translate"
          values="0 0; 0 20; 0 0"
          begin="0.66s"
          dur="1s"
          repeatCount="indefinite"
        ></animateTransform>
      </rect>
    </svg>
  );
}
export default IconLoading;