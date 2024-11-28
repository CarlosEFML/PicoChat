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
	if((pico8gpio[0] & 0x80) == 0x80) // owner = pico8
		return

	let rdsz = pico8gpio[0] & 0x7f // get data length to read
	for(let i=0; i<rdsz; i++) { // read data
		recvData.push(pico8gpio[i+1])
	}

	let wrsz = dataToSend.length>127 ? 127 : dataToSend.length // get data length to write
	for(let i=0;i<wrsz; i++) { // write data
		pico8gpio[i+1]=dataToSend[i]
	}
	dataToSend=dataToSend.slice(wrsz) // removes data sent from the local buffer
	pico8gpio[0] = wrsz + 0x80 // gives ownership to pico8 and write data size
}

function gpioInit(pico8_gpio) {
	pico8gpio=pico8_gpio
	pico8gpio[0]=0x80 // gives ownership to pico8
	requestAnimationFrame(gpioUpdate);
}
