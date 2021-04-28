const conversionUtils = {};

conversionUtils.convertBytes = (bytesize) => {
      let i = 0;
      // 当bytesize 大于是1024字节时，开始循环，当循环到第4次时跳出；
      while (Math.abs(bytesize) >= 1024) {
        bytesize = bytesize / 1024;
        i++;
        if (i === 4) break;
      }
      // 将Bytes,KB,MB,GB,TB定义成一维数组；
      const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const newsize = Math.round(bytesize, 2);
      return newsize + units[i];
}

export default conversionUtils;