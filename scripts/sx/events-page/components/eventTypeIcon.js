/* eslint-disable -- sx-port: ported verbatim from https://sciex.com/scripts/events-page/components/eventTypeIcon.js (2026-09-18); Coveo Headless CDN import rewritten to ../coveo-headless-shim.js where present. See stardust/eds-port-log.md */
export default function getEventIcon(eventType) {
  const svgIcons = {
    Generic: `
        <svg xmlns="http://www.w3.org/2000/svg" width="145" height="109" viewBox="0 0 145 109" fill="none">
          <path d="M53.7613 44.6833C58.1141 44.6833 61.6428 41.1546 61.6428 36.8018C61.6428 32.449 58.1141 28.9203 53.7613 28.9203C49.4085 28.9203 45.8799 32.449 45.8799 36.8018C45.8799 41.1546 49.4085 44.6833 53.7613 44.6833Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M97.8399 44.6833C102.193 44.6833 105.721 41.1546 105.721 36.8018C105.721 32.449 102.193 28.9203 97.8399 28.9203C93.4871 28.9203 89.9585 32.449 89.9585 36.8018C89.9585 41.1546 93.4871 44.6833 97.8399 44.6833Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M40.7227 58.3472C42.5819 53.2195 47.9902 49.2496 53.761 49.2496C59.5317 49.2496 64.94 53.2195 66.7993 58.3472" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M28.6026 81.746L26.3867 82.0559C24.8841 82.0559 23.6621 80.8339 23.6621 79.3313V14.3619C23.6621 12.8593 24.8841 11.6373 26.3867 11.6373L53.7321 15.4377C66.1857 17.1684 78.8147 17.1684 91.2684 15.4377L118.614 11.6373C120.116 11.6373 121.338 12.8593 121.338 14.3619V79.3254C121.338 80.8281 120.116 82.05 118.614 82.05L112.615 81.2139" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M82.9835 90.7091H37.7236C36.221 90.7091 34.999 89.4871 34.999 87.9845V65.72C34.999 64.2173 36.221 62.9954 37.7236 62.9954H78.0137" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M84.8018 69.9647V61.7968C84.8018 57.7683 86.7604 53.9679 90.0989 51.7052C92.3558 50.1734 95.057 49.2496 97.8401 49.2496C100.623 49.2496 103.324 50.1734 105.581 51.7052C108.914 53.9679 110.878 57.7683 110.878 61.7968V69.9647V62.1534V70.3213C110.878 73.9522 109.288 77.3901 106.54 79.6937C105.926 80.2082 105.581 80.9683 105.581 81.7635V94.6381C105.581 96.1407 104.359 97.3627 102.857 97.3627H92.8235C91.3209 97.3627 90.0989 96.1407 90.0989 94.6381V81.7635C90.0989 80.9683 89.754 80.2024 89.140...
        </svg>
      `,
    'In-person event': `
        <svg xmlns="http://www.w3.org/2000/svg" width="145" height="109" viewBox="0 0 145 109" fill="none">
          <path d="M53.7611 74.724C63.8132 74.724 71.9621 66.5752 71.9621 56.523C71.9621 46.4709 63.8132 38.322 53.7611 38.322C43.7089 38.322 35.5601 46.4709 35.5601 56.523C35.5601 66.5752 43.7089 74.724 53.7611 74.724Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M23.6621 100.204C27.9536 88.3645 40.4365 79.2085 53.7613 79.2085C67.0861 79.2085 79.5631 88.3645 83.8605 100.204" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M91.2391 45.1919C101.291 45.1919 109.44 37.0431 109.44 26.9909C109.44 16.9388 101.291 8.78992 91.2391 8.78992C81.187 8.78992 73.0381 16.9388 73.0381 26.9909C73.0381 37.0431 81.187 45.1919 91.2391 45.1919Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M78.2417 52.5998C82.2877 50.7405 86.7137 49.6823 91.2391 49.6823C104.564 49.6823 117.041 58.8383 121.338 70.678" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
        </svg>
      `,
    'Live webinar': `
        <svg xmlns="http://www.w3.org/2000/svg" width="145" height="109" viewBox="0 0 145 109" fill="none">
          <path d="M39.8456 39.3393C36.6883 39.3393 34.104 36.8837 33.8994 33.779C33.8877 33.6504 33.8877 33.5159 33.8877 33.3814C33.8877 30.0897 36.5538 27.4236 39.8456 27.4236H48.3702C51.6619 27.4236 54.328 30.0897 54.328 33.3814C54.328 33.5159 54.328 33.6504 54.3163 33.779C54.1117 36.8895 51.5274 39.3393 48.3702 39.3393" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M48.6508 27.4177H48.3701" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M39.8456 27.4177H39.5649" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M39.5649 39.3394H48.6508" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M29.62 21.4541C26.4627 21.4541 23.8784 18.9984 23.6738 15.8938C23.6621 15.7651 23.6621 15.6307 23.6621 15.4962C23.6621 12.2045 26.3282 9.53833 29.62 9.53833H38.1446C41.4363 9.53833 44.1024 12.2045 44.1024 15.4962C44.1024 15.6307 44.1024 15.7651 44.0907 15.8938C43.8861 19.0043 41.3018 21.4541 38.1446 21.4541" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M38.4252 9.53247H38.1445" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M29.62 9.53247H29.3394" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M29.3394 21.4541H38.4252" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10"/>
          <path d="M51.563 15.4493H118.608C120.111 15.4493 121.333 16.6713 121.333 18.1739V83.1374C121.333 84.6401 120.111 85.862 118.608 85.862H100.167" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M45.5875 85.8679H26.3867C24.8841 85.8679 23.6621 84.6459 23.6621 83.1433V28.6981" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M72.5003 73.9872C82.5525 73.9872 90.7013 65.8384 90.7013 55.7862C90.7013 45.7341 82.5525 37.5852 72.5003 37.5852C62.4482 37.5852 54.2993 45.7341 54.2993 55.7862C54.2993 65.8384 62.4482 73.9872 72.5003 73.9872Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M42.4009 99.4674C46.6924 87.6277 59.1753 78.4717 72.5001 78.4717C85.8249 78.4717 98.3019 87.6277 102.599 99.4674" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
        </svg>
      `,
    'On-demand': `
        <svg xmlns="http://www.w3.org/2000/svg" width="145" height="109" viewBox="0 0 145 109" fill="none">
          <path d="M60.3389 70.1927C60.3389 70.2921 60.4441 70.3564 60.5377 70.3155L89.3389 55.9149C89.4383 55.8622 89.4383 55.7278 89.3389 55.6751L60.5377 41.2745C60.45 41.2278 60.3389 41.2921 60.3389 41.3973V70.1985V70.1927Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
          <path d="M118.614 19.2908H26.3867C24.882 19.2908 23.6621 20.5106 23.6621 22.0154V86.9847C23.6621 88.4895 24.882 89.7093 26.3867 89.7093H118.614C120.118 89.7093 121.338 88.4895 121.338 86.9847V22.0154C121.338 20.5106 120.118 19.2908 118.614 19.2908Z" stroke="#1A181B" stroke-width="3" stroke-miterlimit="10" stroke-linecap="round"/>
        </svg>
      `,
  };

  return svgIcons[eventType] || '';
}
