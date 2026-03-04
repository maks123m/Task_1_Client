let product = "Socks";
let eventBus = new Vue()

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        details: {
            type: Array
        },
        shipping: {
            type: String
        }
    },

    template: `
        <div>   
            <ul>
                <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                >{{ tab }}</span>
            </ul>

            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>

                <div v-if="reviews.length">
                    <button @click="sortBy = 'recommend'">Sort by Recommend</button>
                    <button @click="sortBy = 'rating'">Sort by Rating</button>
                </div>

                <ul>
                    <li v-for="review in displayedReviews">
                        <p>{{ review.name }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p>{{ review.review }}</p>
                        <p>Recomend: {{ review.survey }} </p>
                    </li>
                </ul>
            </div>

            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>

            <div v-show="selectedTab === 'Details'">
                <product-details :details="details"></product-details>
            </div>

            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping: {{ shipping }} </p>
            </div>
            
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Details', 'Shipping'],
            selectedTab: 'Reviews',
            sortBy: 'none'
        }
    },

    methods: {
        addReview(review) {
            this.$emit('review-submitted', review);
        }
    },

    computed: {
        displayedReviews() {
            if (this.sortBy === 'recommend') {
                return [...this.reviews].sort((a, b) => {
                    if (a.survey === 'Yes' && b.survey === 'No') return -1;
                    if (a.survey === 'No' && b.survey === 'Yes') return 1;
                    return 0;
                });
            }

            if (this.sortBy === 'rating') {
                return [...this.reviews].sort((a, b) => b.rating - a.rating);
            }
            return this.reviews;
        }
    }
})



Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
    `
})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
        </p>

        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="review"></textarea>
        </p>

        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>
            Would you recommend this product?
            <label><input type="radio" name ="survey" value="Yes" v-model="survey">Yes</input></label>
            <label><input type="radio" name ="survey" value="No" v-model="survey">No</input></label>
        </p>

        <p>
            <input type="submit" value="Submit"> 
        </p>
    </form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            survey: '',
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.survey) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    survey: this.survey
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.survey = ''
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.survey) this.errors.push("Survey required.")
            }
        }

    }

})


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p>{{ description }}</p>

            <span v-show="onSale"> {{ saleMessage }}</span>

            <p v-if="inStock > 10">In stock</p>
            <p v-else-if="inStock <= 10 && inStock > 0">Almost sold out!</p>
            <p v-else :style="{ textDecoration: !inStock ? 'line-through' : '' }">Out of Stock</p>
            

            <p>Size</p>
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            
            <div
                class="color-box"
                v-for="(variant, index) in variants"
                :key="variant.variantId"
                :style="{ backgroundColor:variant.variantColor }"
                @mouseover="updateProduct(index)"
            >
            </div>
            
            <button 
            v-on:click="addToCart" 
            :disabled="!inStock"
            :class="{ disabledButton: !inStock }"
            >
            Add to cart</button>

            <button v-on:click="deleteToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
            Delete to cart</button><br>

            <a :href="link"> {{ more }}</a>
            
        </div>

        <product-tabs :reviews="reviews" :details="details" :shipping="shipping"></product-tabs>

    </div>
 `,

    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            more: "More products like this",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            onSale: true,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10

                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0

                }
            ],

            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },

        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        deleteToCart() {
            this.$emit('delete-to-cart', this.variants[this.selectedVariant].variantId);
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },

        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        saleMessage() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + 'is on sale!';
            } else {
                return this.brand + ' ' + this.product + ' is not on sale';
            }
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }

})
let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteCart(id) {
            const index = this.cart.lastIndexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
    }
})