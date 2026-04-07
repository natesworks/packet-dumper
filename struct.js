const base = Process.getModuleByName("libg.so").base;

class ByteStreamVtable {
  static vtable = base.add(0x17700b8);

  static index(index) {
    return this.vtable.add(index * Process.pointerSize).readPointer();
  }
}

let state = 0;
const enabled = true;

if (enabled) {
  Interceptor.attach(base.add(0xf4c6c4), {
    onEnter() {
      console.log("Beginning dump");
      state = 1;
    },
    onLeave() {
      state = 0;
      File.writeAllText(
        "/data/data/com.natesworks.royaleoffline/dump.txt",
        contents,
      );
      console.log("Finished dumping");
    },
  });
}

let contents = "";

function append(text) {
  contents += text + "\n";
}

// LogicLong::decode
Interceptor.attach(base.add(0x10fd298), {
  onEnter(args) {
    this.logicLong = args[0];
  },

  onLeave() {
    if (state == 1) {
      append(
        "LogicLong(" +
          this.logicLong.readS32() +
          ", " +
          this.logicLong.add(4).readS32() +
          ").encode(&stream);",
      );
    }
  },
});

const getString = new NativeFunction(base.add(0x1111320), "pointer", [
  "pointer",
]);

// LogicCompressedString::decode
Interceptor.attach(base.add(0x11112c4), {
  onEnter(args) {
    this.instance = args[0];
    if (state == 1) {
      state = 2;
    }
  },
  onLeave(retval) {
    if (state == 2) {
      append(
        'LogicCompressedString(new String("' +
          decodeString(getString(retval)) +
          '")).encode(&stream);',
      );
      state = 1;
    }
  },
});

function decodeString(ptr) {
  const len = ptr.add(4).readInt();
  if (len > 7) {
    return ptr.add(8).readPointer().readUtf8String(len);
  }
  return ptr.add(8).readUtf8String(len);
}

Interceptor.attach(ByteStreamVtable.index(23), {
  onEnter(args) {
    this.a3 = this.context.x8;
  },

  onLeave(retval) {
    if (state == 1) {
      if (!retval.isNull() && !this.a3.isNull()) {
        append(
          'stream.writeStringReference(new String("' +
            decodeString(this.a3) +
            '"));',
        );
      } else {
        append("stream.writeStringReference(nullptr);");
      }
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(24), {
  onLeave(retval) {
    if (state == 1)
      if (!retval.isNull()) {
        append(
          'stream.writeString(new String("' + decodeString(retval) + '"));',
        );
      } else {
        append("stream.writeString(nullptr);");
      }
  },
});

Interceptor.attach(ByteStreamVtable.index(25), {
  onLeave(retval) {
    if (state == 1)
      if (!retval.isNull()) {
        append(
          'stream.writeString(new String("' + decodeString(retval) + '"));',
        );
      } else {
        append("stream.writeString(nullptr);");
      }
  },
});

Interceptor.attach(ByteStreamVtable.index(26), {
  onEnter(args) {
    if (state == 1) console.warn("readFilteredStringReference called");
  },
});

Interceptor.attach(ByteStreamVtable.index(27), {
  onEnter(args) {
    if (state == 1) console.warn("readFilteredStringReference called");
  },
});

Interceptor.attach(ByteStreamVtable.index(28), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeBoolean(" + Boolean(retval.toInt32()) + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(29), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writePackedBoolean(" + Boolean(retval.toInt32()) + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(30), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeInt(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(31), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeInt8(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(32), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeInt16(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(33), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeInt24(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(34), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeVInt(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(35), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeVLong(" + new Int64(retval.toString()) + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(36), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeLongLong(" + new Int64(retval.toString()) + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(37), {
  onEnter() {
    if (state == 1) {
      state = 2;
    }
  },
  onLeave(retval) {
    if (state == 2) {
      append(
        "stream.writeLong(LogicLong(" +
          retval.readS32() +
          ", " +
          retval.add(4).readS32() +
          ");",
      );
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(38), {
  onEnter(args) {
    if (state == 1) {
      state = 2;
    }
  },
  onLeave(retval) {
    if (state == 2) {
      append(
        "stream.writeLong(LogicLong(" +
          retval.readS32() +
          ", " +
          retval.add(4).readS32() +
          ");",
      );
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(40), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeInt(" + retval.toInt32() + ");"); // note: usually you do writeBytes which writes both bytes and the length
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(41), {
  onEnter(args) {
    if (state == 1) {
      this.len = args[1].toInt32();
    }
  },
  onLeave(byteArray) {
    if (state == 1) {
      const buffer = byteArray.readByteArray(this.len);
      const uint8Array = new Uint8Array(buffer);
      const bytesString = Array.from(uint8Array)
        .map((b) => "0x" + b.toString(16).padStart(2, "0"))
        .join(", ");

      append(
        "stream.writeBytesWithoutLength({ " +
          bytesString +
          " }, " +
          this.len +
          ");",
      ); // note: usually you do writeBytes which writes both bytes and the length
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(42), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeByte(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(43), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeShort(" + retval.toInt32() + ");");
    }
  },
});

Interceptor.attach(ByteStreamVtable.index(44), {
  onLeave(retval) {
    if (state == 1) {
      append("stream.writeFloat(" + retval.readFloat() + "f);");
    }
  },
});
