/* JavaScript Document */
jQuery(document).ready(function () {
	'use strict';

	/* image-carousel function by = owl.carousel.js */
	jQuery('.img-carousel').owlCarousel({
		loop: true,
		margin: 30,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			1024: {
				items: 3
			},
			1200: {
				items: 4
			}
		}
	})

	/* image-carousel no margin function by = owl.carousel.js */
	jQuery('.img-carousel-content').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			1024: {
				items: 3
			},
			1200: {
				items: 4
			}
		}
	})

	/* service carousel no margin function by = owl.carousel.js */
	jQuery('.service-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			1200: {
				items: 3
			},
			1400: {
				items: 4
			}
		}
	})

	/*  Portfolio Carousel function by = owl.carousel.js */
	jQuery('.portfolio-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			1024: {
				items: 3
			},
			1200: {
				items: 4
			}
		}
	})

	/*  Portfolio Carousel no margin function by = owl.carousel.js */
	jQuery('.portfolio-carousel-nogap').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 0,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 2
			},

			767: {
				items: 3
			},
			1200: {
				items: 4
			}
		}
	})

	/*  Blog post Carousel function by = owl.carousel.js */
	jQuery('.blog-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			991: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	})

	/*  Blog post Carousel function by = owl.carousel.js */
	jQuery('.latest-news').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: true,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			991: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	})

	/*  Blog post Carousel function by = owl.carousel.js */
	jQuery('.client-logo-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 2
			},

			767: {
				items: 3
			},
			1000: {
				items: 5
			}
		}
	})

	/* Fade slider for home function by = owl.carousel.js */
	jQuery('.owl-fade-one').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		autoplayTimeout: 2000,
		margin: 30,
		nav: true,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		items: 1,
		dots: false,
		animateOut: 'fadeOut',
	})

	/*  testimonial one function by = owl.carousel.js */
	jQuery('.testimonial-one').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 1
			},

			767: {
				items: 1
			},
			1000: {
				items: 1
			}
		}
	})

	/* testimonial two function by = owl.carousel.js */
	jQuery('.testimonial-two').owlCarousel({
		loop: true,
		margin: 30,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 2
			},

			991: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	})

	/*  testimonial three function by = owl.carousel.js */
	jQuery('.testimonial-three').owlCarousel({
		loop: true,
		margin: 30,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 2
			},

			991: {
				items: 2
			},
			1000: {
				items: 3
			}
		}
	})

	/*  testimonial four function by = owl.carousel.js */
	jQuery('.testimonial-four').owlCarousel({
		loop: true,
		margin: 80,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			991: {
				items: 2
			}
		}
	})

	/*  testimonial four function by = owl.carousel.js */
	jQuery('.testimonial-five').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: false,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},
			991: {
				items: 2
			}
		}
	})

	/*  testimonial one function by = owl.carousel.js */
	jQuery('.project-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 1
			},

			767: {
				items: 1
			},
			1000: {
				items: 1
			}
		}
	})

	/*  testimonial one function by = owl.carousel.js */
	jQuery('.creative-slider-carousel').owlCarousel({
		loop: true,
		autoplaySpeed: 3000,
		navSpeed: 3000,
		paginationSpeed: 3000,
		slideSpeed: 3000,
		smartSpeed: 3000,
		autoplay: 3000,
		margin: 30,
		nav: true,
		dots: false,
		navText: ['<i class="ti-angle-left"></i>', '<i class="ti-angle-right"></i>'],
		responsive: {
			0: {
				items: 1
			},

			480: {
				items: 1
			},

			767: {
				items: 1
			},
			1000: {
				items: 1
			}
		}
	})





	
	// banner swiper start
	var swiper = new Swiper(".bannerSwiper", {
		spaceBetween: 30,
		effect: "fade",
		loop: true,
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},

	});






	
// ads section swiper 
var swiper = new Swiper(".partner", {
	slidesPerView: 5,
	spaceBetween: 30,
  
	slidesPerGroup: 5,
	loop: true,
	loopFillGroupWithBlank: true,
  
	breakpoints: {
	  360: {
		slidesPerView: 1,
		slidesPerGroup: 1,
	  },
	  600: {
		slidesPerView: 3,
		slidesPerGroup: 3,
	  },
	  768: {
		slidesPerView: 4,
		slidesPerGroup: 4,
	  },
	  991: {
		slidesPerView: 5,
		slidesPerGroup: 5,
	  }
  
  
	}
  });
  



//   testimonial swiper
var swiper = new Swiper(".testimonial", {
	spaceBetween: 40,
	pagination: {
	  el: ".swiper-pagination",
	},
	loop: true,
	navigation: {
	  nextEl: ".testimonial-control-next",
	  prevEl: ".testimonial-control-prev",
	},
  });
  
  



// blog swiper slide 

var swiper = new Swiper(".blogSwiper", {
	spaceBetween: 30,
	effect: "fade",
	speed: 1000,
	autoplay: {
	  delay: 1000,
	},
  
	loop: true,
	navigation: {
	  nextEl: ".swiper-button-next",
	  prevEl: ".swiper-button-prev",
	},
  
});
  
  



  
  


});
/* Document .ready END */