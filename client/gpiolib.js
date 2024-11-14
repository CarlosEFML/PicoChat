let dataToSend=[]
let recvData=[]
let pico8gpio=[]

function recvPack(asstring) {
	if(recvData.length>1) {
		let pkglen = recvData[0] + recvData[1]*256
		if(recvData.length>=(pkglen+2)) {
			let data=recvData.slice(2,2+pkglen)
			recvData=recvData.slice(2+pkglen)
			if(asstring) {
				for(let i=0; i<data.length; i++) {
					data[i]=String.fromCharCode(data[i])
				}
				data=data.join('')
			}
			return data
		}
	}
	return null
}

function sendPack(data, isstring) {
	let len=data.length
	dataToSend.push(len & 0xff)
	dataToSend.push(len >> 8)
	for(let i=0; i<len; i++) {
		dataToSend.push(isstring ? data.charCodeAt(i) : data[i])
	}
}

function gpioUpdate() {
	requestAnimationFrame(gpioUpdate);
	// Pico8 was interrupted while writing data to gpio bus
	if(pico8gpio[1]==0xfe) {
		return
	}

	if((pico8gpio[1] & 0xff) != 0xff) { // data sent by pico8
		let len = pico8gpio[1] & 0xff
		for(let i=0; i<len; i++) {
			recvData.push(pico8gpio[i+2])
		}
		pico8gpio[1] = 0xff // request data from pico8
	}
	if((pico8gpio[0] & 0xff) == 0xff) { // pico8 requesting data
		let len=dataToSend.length>126?126:dataToSend.length
		for(let i=0;i<len; i++) {
			pico8gpio[i+2]=dataToSend[i]
		}
		dataToSend=dataToSend.slice(len)
		pico8gpio[0] = len
	}
}

function gpioInitLoop() {
	if((pico8gpio[0]==0xff) && (pico8gpio[1]==0)) {
		gpioUpdate()
	} else {
		requestAnimationFrame(gpioInitLoop);
	}
}

function gpioInit(pico8_gpio) {
	pico8gpio=pico8_gpio
	gpioInitLoop()
}
