const base = Process.getModuleByName("libg.so").base;

function getMessageType(message) {
  let vtable = message.readPointer();
  let getMessageType = new NativeFunction(
    vtable.add(40).readPointer(),
    "int",
    [],
  );
  return getMessageType();
}

function getEncodingLength(message) {
  let stream = message.add(8);
  let size = stream.add(20).readS32();
  let offset = stream.add(24).readS32();
  return offset > size ? offset : size;
}

Interceptor.attach(base.add(0xa20100), {
  onEnter(args) {
    this.message = args[1];
  },

  onLeave() {
    let type = getMessageType(this.message);
    let length = getEncodingLength(this.message);

    console.log("Recieved message of type:", type);
    console.log("Length:", length);
    let payloadPtr = this.message.add(8).add(56).readPointer();
    let payload = payloadPtr.readByteArray(length);
    console.log(payload);
    File.writeAllBytes(
      `/data/data/com.natesworks.royaleoffline/${type}.bin`,
      payload,
    );
  },
});