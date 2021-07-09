const got = require('got');

(async () => {
  const isTrailerUrlExists = async (trailerUrl) => {
    try {
      const res = await got.head(trailerUrl);
      return res.statusCode === 200;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const result = await isTrailerUrlExists(
    'https://www.prestige-av.com/sample_movie/TKTABsW-087.mp4'
  );
  if (result) {
    console.log('nice');
  } else {
    console.log('bad');
  }
})();
