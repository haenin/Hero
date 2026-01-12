<!-- 
  <pre>
  Vue Name   : TheFooter.vue
  Description : 하단 공통 푸터 컴포넌트
 
  History
  2025/11/28 - 승건 최초 작성
  </pre>
 
  @author 승건
  @version 1.0
 -->
 <template>
  <footer class="footer">
    <div class="footer__content">
      <span>© 2025 HERO. All rights reserved.</span>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.footer {
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  padding: 20px 32px;
}

.footer__content {
  font-size: 12px;
  color: #9ca3af;
}
</style>
