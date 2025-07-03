import React from 'react';
import '../Styles/Weightsbalance.css';
import { Link } from 'react-router-dom';
import PutterTracker from '../Components/PutterTracker';
const Weightsbalance = () => {
  return (
    <div className="page-container">
      <div className="bg-[#323232] flex flex-row justify-center w-full">
      <div className="bg-[#323232] overflow-hidden w-[393px] h-[852px] relative">
        {/* Status Bar */}
        <div className="flex flex-col w-full items-center absolute top-0 left-0 bg-materialschrome border-b-[0.33px] [border-bottom-style:solid] border-[#0000004c] backdrop-blur-[25px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(25px)_brightness(100%)] bg-blend-hard-light">
          <div className="relative self-stretch w-full h-[54px] bg-black">
            <div className="absolute top-[17px] left-[52px] [font-family:'SF_Pro-Semibold',Helvetica] font-normal text-white text-[17px] text-center tracking-[0] leading-[22px] whitespace-nowrap">
              9:41
            </div>
            <div className="absolute w-[140px] h-[54px] top-0 left-[252px]">
              <div className="absolute w-[27px] h-[13px] top-[23px] left-[81px]">
                <div className="absolute w-[25px] h-[13px] top-0 left-0 rounded-[4.3px] border border-solid border-[#ffffff59]">
                  <div className="relative w-[21px] h-[9px] top-px left-px bg-white rounded-[2.5px]" />
                </div>
                <div className="absolute w-px h-1 top-[5px] left-[26px] bg-white" />
              </div>
              <div className="absolute w-[17px] h-3 top-6 left-[57px] bg-white" />
              <div className="absolute w-[19px] h-3 top-6 left-[30px] bg-white" />
            </div>
          </div>
        </div>

        {/* iPhone Shape Overlay */}
        <div className="absolute w-[393px] h-[852px] top-0 left-0 bg-[url(/iphone-14-pro-display-shape.png)] bg-[100%_100%]" />

        {/* Top Gradient */}
        <div className="absolute w-[393px] h-[120px] top-[54px] left-0 bg-[linear-gradient(180deg,rgba(0,0,0,1)_8%,rgba(0,0,0,0.54)_61%,rgba(0,0,0,0)_100%)]" />

        {/* Logo and Profile */}
        <div className="absolute w-[165px] h-9 top-[62px] left-[118px]">
          <div className="relative h-9 bg-[url(/group.png)] bg-[100%_100%]">
            <div className="absolute w-[3px] h-9 top-0 left-[81px] bg-[#cb0000]" />
          </div>
        </div>
        <div className="absolute w-[31px] h-[31px] top-[65px] left-[351px] rounded-full bg-gray-400 overflow-hidden">
          <img src="" alt="Profile" className="w-full h-full object-cover" />
        </div>

        {/* Hamburger Menu */}
        <div className="absolute w-[30px] h-[30px] top-[68px] left-[29px] flex items-center justify-center">
          <Menu className="w-[22px] h-3.5 text-white" />
        </div>

        {/* Main Title */}
        <div className="absolute top-[174px] left-[35px] [font-family:'Good_Times-Regular',Helvetica] font-normal text-[#cb0000] text-[28px] text-center tracking-[0] leading-[normal]">
          WEIGHTS BALANCE
        </div>

        {/* Easy Setup Section */}
        <Card className="absolute w-[393px] h-[243px] top-[242px] left-0 bg-black rounded-none border-0">
          <CardHeader className="p-0">
            <div className="w-[393px] h-[33px] bg-[#1d1d1d] flex items-center justify-center">
              <div className="[font-family:'Good_Times-Regular',Helvetica] font-normal text-sm text-center tracking-[0] leading-[normal]">
                <span className="text-[#cb0000]">EASY</span>
                <span className="text-white">&nbsp;&nbsp;SETUP</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4">
            <p className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-[15px] text-center tracking-[0] leading-[normal]">
              Let&apos;s fine-tune your putter to match your feel. Hit a few
              putts on the green, tell us how it went and we&apos;ll guide you
              to the ideal balance.
              <br />
              Quick, intuitive, and surprisingly accurate
            </p>
            <div className="flex justify-center mt-8">
              <Button className="w-[245px] h-[41px] bg-white text-black rounded-[15px] shadow-[4px_4px_0px_#ff0000] hover:bg-white hover:text-black">
                <span className="[font-family:'Good_Times-Regular',Helvetica] font-normal text-xl">
                  START
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expert Setup Section */}
        <Card className="absolute w-[393px] h-[243px] top-[503px] left-0 bg-black rounded-none border-0">
          <CardHeader className="p-0">
            <div className="w-[393px] h-[33px] bg-[#1d1d1d] flex items-center justify-center">
              <div className="[font-family:'Good_Times-Regular',Helvetica] font-normal text-sm text-center tracking-[0] leading-[normal]">
                <span className="text-[#cb0000]">EXPERT</span>
                <span className="text-white">&nbsp;&nbsp;SETUP</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 px-4">
            <p className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-[15px] text-center tracking-[0] leading-[normal]">
              Ready to dial in your performance? Set up your phone on a tripod
              and let the AI analyze your stroke in real-time. From face angle
              to ball direction — we use data to define your optimal balance.
            </p>
            <div className="flex justify-center mt-8">
              <Button className="w-[245px] h-[41px] bg-white text-black rounded-[15px] shadow-[4px_4px_0px_#ff0000] hover:bg-white hover:text-black">
                <span className="[font-family:'Good_Times-Regular',Helvetica] font-normal text-xl">
                  START
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Separators */}
        <Separator className="absolute w-[393px] h-0.5 top-[241px] left-0 bg-[#cb0000]" />
        <Separator className="absolute w-[393px] h-0.5 top-[502px] left-0 bg-[#cb0000]" />
        <Separator className="absolute w-[393px] h-0.5 top-[763px] left-0 bg-[#cb0000]" />

        {/* Bottom Navigation Bar */}
        <div className="absolute w-[393px] h-[88px] top-[764px] left-0 bg-[#181818]">
          <div className="absolute w-[392px] h-[87px] top-0 left-0 flex">
            <div className="relative w-[98px] h-[87px] flex flex-col items-center justify-center">
              <div className="w-8 h-[22px] mb-1">
                <img src="" alt="Home icon" className="w-full h-full" />
              </div>
              <div className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-xs text-center">
                HOME
              </div>
            </div>

            <div className="relative w-[98px] h-[87px] flex flex-col items-center justify-center">
              <div className="w-[38px] h-[39px] mb-1">
                <img
                  src=""
                  alt="AI Fit icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-xs text-center">
                AI FIT
              </div>
            </div>

            <div className="relative w-[98px] h-[87px] bg-[#cb0000] flex flex-col items-center justify-center">
              <SettingsIcon className="w-7 h-7 mb-1 text-white" />
              <div className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-xs text-center">
                SET
              </div>
            </div>

            <div className="relative w-[98px] h-[87px] flex flex-col items-center justify-center">
              <Play className="w-[30px] h-[30px] mb-1 text-white" />
              <div className="[font-family:'Avenir-Light',Helvetica] font-light text-white text-xs text-center">
                TRAIN
              </div>
            </div>
          </div>

          {/* Vertical Separator */}
          <div className="absolute w-0.5 h-[47px] top-[16px] left-[97px] bg-gray-700" />

          {/* Navigation Arrow */}
          <ChevronRight className="absolute w-3.5 h-3.5 top-[28px] left-[369px] text-white" />
        </div>

        {/* Home Indicator */}
        <div className="absolute w-[393px] h-[21px] top-[831px] left-0 flex justify-center items-center">
          <div className="w-[139px] h-[5px] bg-white rounded-[100px]" />
        </div>
      </div>
    </div>
    </div>
  );
};

export default AIFit;
