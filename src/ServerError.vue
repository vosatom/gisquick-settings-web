<template>
  <div class="error-page f-col-ac f-justify-center">
    <div/>
    <img src="@/assets/text_logo.svg" class="logo"/>
    <h1>Server Error!</h1>
    <img src="@/assets/server_error.svg" class="image"/>
    <div/>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  height: 100%;
  > * {
    margin: 24px 6px;
  }
}
.logo {
  height: 50px;
  width: auto;
}
.image {
  height: 180px;
}
h1 {
  color: var(--color-red);
}
</style>
