let bands=[]


//HTML情報取得
    const bandform=document.getElementById('bandform')
    const bandnameInput=document.getElementById('bandname')
    const memberInput=document.getElementById('member')
    const bandlist=document.getElementById('bandlist')
    const TTmakeButton=document.getElementById('TTmake')
    const timetable=document.getElementById('timetable')
    const performancetimeInput=document.getElementById('performancetime');

//バンド登録
    bandform.addEventListener('submit',function(e){
        e.preventDefault()

        const name=bandnameInput.value;
        const member=memberInput.value.split('、');
        const performancetime=Number(performancetimeInput.value);

        const bandinfo={name:name,member:member,performancetime:performancetime};
        bands.push(bandinfo);

         addBandToDom(bandinfo);
         saveBandsToCookie();
         
         bandnameInput.value = '';
         memberInput.value = '';
         performancetimeInput.value = '';
        })

//時間の表記を0:00:00にする
    function formattime(minutes){
        const h=Math.floor(minutes/60)
        const m=minutes%60
        const s="00"

        return`${h}:${m}:${s}`;
    }


//タイムテーブル作成ボタン実行
    TTmakeButton.addEventListener('click',function(){
        const tbody=timetable.querySelector('tbody');
        tbody.innerHTML='';
        const result=solve(bands);

        if(result){
            let currentMinute=0;

            result.forEach(function(band,index){
                const startMinute=currentMinute;
                const endMinute=startMinute+band.performancetime

                const tr=document.createElement('tr');
                tr.innerHTML=
                    `<td>${formattime(startMinute)}～${formattime(endMinute)}</td>
                    <td>${band.name}</td>
                    <td>${band.member.join('、')}</td>`;
                tbody.appendChild(tr);

                currentMinute=endMinute+2;
            });
        }else{
            timetable.innerHTML='<p>作成失敗</p>'
        }
    });

//メンバー被り判定
    function hasCommon(b1,b2){
        return b1.member.some(function(m) {return b2.member.includes(m)});
    }

//連続出演を回避する順番の算出
    function solve(list){
        const result=[];
        const used=new Array(list.length).fill(false);

        function backtrack(){
            if(result.length===list.length)return true;
            for(let i=0; i<list.length; i++){
                if(used[i])continue;
                if(result.length>0 && hasCommon(result[result.length-1],list[i])){continue;}

                result.push(list[i]);
                used[i]=true;

                if(backtrack())return true;

                result.pop();
                used[i]=false;
            }
            return false;
        }
        return backtrack()? result:null

    }


// DOM追加と削除イベントの共通関数
function addBandToDom(bandinfo) {
    const tbody = bandlist.querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${bandinfo.name}</td><td>${bandinfo.performancetime}分</td><td>${bandinfo.member.join('、')}</td><td><button class="delete-button">✕</button></td>`;
    
    tr.querySelector('.delete-button').addEventListener('click', function(){
        bands = bands.filter(function(b){ return b !== bandinfo; });
        tr.remove();
        saveBandsToCookie();
    });

    tbody.appendChild(tr);
}

// Cookie操作関数
function saveBandsToCookie() {
    document.cookie = `bandsData=${encodeURIComponent(JSON.stringify(bands))}`;
}

function loadBandsFromCookie() {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key === 'bandsData' && value) {
            try {
                bands = JSON.parse(decodeURIComponent(value));
                bands.forEach(function(b) { addBandToDom(b); });
            } catch (e) {}
        }
    }
}

// 初期実行
loadBandsFromCookie();
