function optimize(url, original, width, height) {
  const isUrlString = typeof url === 'string';

  if (!isUrlString) {
    console.warn('The passed url is not a string:', { url });
  }

  url = isUrlString ? url : '';
  if (url.startsWith('blob:') || url.startsWith('file:')) {
    return url;
  }
  let link = url;
  if (link.startsWith('us-west') || link.startsWith('null')) {
    link = `https://chforum.backendcdn.com/${link}`;
  }
  const [domain, query] = link.split('?');
  link = domain;
  link = link
    .replace(
      'profile-clouthub.s3.us-west-1.amazonaws.com',
      'chprofile.backendcdn.com'
    )
    .replace(
      'profile-clouthub.s3-accelerate.amazonaws.com',
      'chprofile.backendcdn.com'
    )
    .replace(
      'forum-clouthub.s3.us-west-1.amazonaws.com',
      'chforum.backendcdn.com'
    )
    .replace(
      'forum-clouthub.s3-accelerate.amazonaws.com',
      'chforum.backendcdn.com'
    )
    .replace('d3029vgllsqvv6.cloudfront.net', 'chforum.backendcdn.com')
    .replace(
      's3-us-west-2.amazonaws.com/clouthub-profile-photo',
      'chprofilephoto.backendcdn.com'
    )
    .replace(
      'clouthub-forum-file.s3.us-west-2.amazonaws.com',
      'chforumfile.backendcdn.com'
    )
    .replace(
      's3-us-west-2.amazonaws.com/clouthub6f76e346b91d4baeaa0fcef1ef93249b',
      'chrandom.backendcdn.com'
    );

  link += '?';

  if (width || height) {
    link += `optimizer=image&`;
  }

  if (width) {
    link += `width=${width}&`;
  }

  if (height) {
    link += `height=${height}&`;
  }

  if (query) {
    link += `&${query}`;
  }

  return link;
}

export default {
  optimize,
};
