import * as React from "react"

const IntegrationsIcon = (props: any) => (
  <svg
    width={153}
    height={35}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 19.658c.369.586 1.069 1.163 2.976 1.16H21.53c.72 0 1.53.539 1.815 1.207l3.077 7.284c.282.668-.074 1.21-.793 1.21H6.614c-1.131-.072-2.181-.37-2.667-1.52L0 19.66ZM15.955 4.591l3.112 7.375c.282.67.106 1.638-.396 2.162l-4.512 4.81H3.901c-1.625.018-2.588-.608-1.207-2.136L14.539 4.328c.5-.524 1.134-.408 1.416.263Z"
      fill="url(#a)"
    />
    <g clipPath="url(#b)">
      <path
        d="M68 34c9.389 0 17-7.611 17-17S77.389 0 68 0 51 7.611 51 17s7.611 17 17 17Z"
        fill="url(#c)"
      />
      <mask
        id="e"
        style={{
          maskType: "alpha",
        }}
        maskUnits="userSpaceOnUse"
        x={51}
        y={0}
        width={34}
        height={34}
      >
        <path
          d="M68 34c9.389 0 17-7.611 17-17S77.389 0 68 0 51 7.611 51 17s7.611 17 17 17Z"
          fill="url(#d)"
        />
      </mask>
      <g mask="url(#e)">
        <path
          d="M62.4 12.773a.715.715 0 0 0-.56-.26h-4.542a.131.131 0 0 1-.098-.038.117.117 0 0 1-.038-.084V9.33c0-.03.013-.059.038-.084a.13.13 0 0 1 .098-.039h4.799c1.21 0 2.255.495 3.133 1.484l1.165 1.423-2.27 2.77-1.726-2.112Zm8.385-2.096c.878-.98 1.927-1.469 3.148-1.469h4.783c.04 0 .071.01.091.03.02.021.03.052.03.093v3.06c0 .03-.01.059-.03.084-.02.025-.05.038-.09.038h-4.541a.715.715 0 0 0-.56.26l-3.346 4.07 3.36 4.1a.716.716 0 0 0 .546.245h4.54c.04 0 .071.013.091.039.02.025.03.059.03.099v3.06c0 .03-.01.059-.03.084-.02.026-.05.038-.09.038h-4.784c-1.22 0-2.265-.494-3.133-1.484l-2.785-3.396-2.785 3.396c-.878.99-1.927 1.484-3.148 1.484h-4.784c-.04 0-.07-.012-.09-.038a.154.154 0 0 1-.03-.1v-3.06c0-.03.01-.058.03-.084.02-.025.05-.038.09-.038h4.541a.744.744 0 0 0 .56-.26l3.285-4.009 5.101-6.242Z"
          fill="#00D1FF"
        />
      </g>
    </g>
    <mask
      id="f"
      style={{
        maskType: "luminance",
      }}
      maskUnits="userSpaceOnUse"
      x={109}
      y={0}
      width={44}
      height={35}
    >
      <path d="M153 0h-44v34.158h44V0Z" fill="#fff" />
    </mask>
    <g mask="url(#f)">
      <path
        d="m150.765 31.885-19.683-29.57-19.743 29.57h27.506L131.082 20.6l-3.851 5.864h-4.095l7.946-11.79 11.492 17.212h8.191Z"
        fill="url(#g)"
      />
    </g>
    <defs>
      <linearGradient
        id="a"
        x1={24.962}
        y1={9.515}
        x2={5.236}
        y2={34.433}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#63E1D6" />
        <stop offset={1} stopColor="#17B89B" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={68}
        y1={0}
        x2={68}
        y2={49.712}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#08021E" />
        <stop offset={1} stopColor="#1F0777" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={68}
        y1={0}
        x2={68}
        y2={49.712}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#08021E" />
        <stop offset={1} stopColor="#1F0777" />
      </linearGradient>
      <linearGradient
        id="g"
        x1={132.471}
        y1={3.085}
        x2={119.556}
        y2={35.032}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#03D1CF" stopOpacity={0.988} />
        <stop offset={1} stopColor="#4E09F8" />
      </linearGradient>
      <clipPath id="b">
        <path fill="#fff" transform="translate(51)" d="M0 0h34v34H0z" />
      </clipPath>
    </defs>
  </svg>
)

export default IntegrationsIcon
