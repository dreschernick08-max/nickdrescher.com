const assert=require('assert');
const motion=require('../assets/orbit-layout.js');
const cases=[
 {view:{width:1348,height:936,left:14,right:1334,top:18,bottom:908},area:{left:370,right:978,top:243,bottom:554}},
 {view:{width:1024,height:768,left:14,right:1010,top:100,bottom:740},area:{left:270,right:754,top:210,bottom:460}},
 {view:{width:768,height:760,left:14,right:754,top:100,bottom:732},area:{left:205,right:563,top:210,bottom:445}}
];let count=0;
function check(pos,image,area,v){
 const w=image.width*pos.scale/2,h=image.height*pos.scale/2,e=.02;
 assert(pos.scale>=0&&pos.scale<=1);
 assert(pos.x-w>=v.left-e&&pos.x+w<=v.right+e&&pos.y-h>=v.top-e&&pos.y+h<=v.bottom+e,'viewport');
 assert(pos.x+w<=area.left+e||pos.x-w>=area.right-e||pos.y+h<=area.top+e||pos.y-h>=area.bottom-e,'text overlap');count++;
}
for(const c of cases)for(const image of [{width:320,height:280},{width:230,height:360},{width:380,height:280}])for(let i=0;i<720;i++)check(motion.aroundText(i*Math.PI/360,image,c.area,c.view),image,c.area,c.view);
for(const width of [320,375,390,430]){
 const v={width,height:834,left:14,right:width-14,top:100,bottom:806},a={left:width*.05,right:width*.95,top:270,bottom:485},image={width:145,height:190};
 for(const base of [{x:75,y:160},{x:width-60,y:650}])for(let i=0;i<720;i++)check(motion.inBand(i*Math.PI/360,image,a,v,base),image,a,v);
}
console.log(count+' positions checked: text remains clear; images remain within the viewport.');
