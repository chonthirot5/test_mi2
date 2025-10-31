$(function () {
  document.addEventListener('DOMContentLoaded', function () {
    function readUserData() {
      if (typeof Cookies === 'undefined' || !Cookies.get) {
        return null;
      }
      const raw = Cookies.get('userData');
      if (!raw) {
        return null;
      }
      try {
        const decoded = decodeURIComponent(raw);
        return JSON.parse(decoded);
      } catch (error) {
        console.warn('Unable to parse user data cookie', error);
        return null;
      }
    }

    function computeProjects(sourceProjects) {
      if (Array.isArray(sourceProjects) && sourceProjects.length) {
        return sourceProjects.map(function (project) {
          return {
            project: project.project || project.name || 'ไม่ระบุชื่อโปรเจกต์',
            roles: Array.isArray(project.roles) ? project.roles : [],
            status: project.status,
            progress: project.progress,
          };
        });
      }
      return [
        { project: 'COLOR_LIMIT', roles: ['EDITOR'], status: 'กำลังดำเนินการ', progress: 68 },
        { project: 'HRM', roles: ['ADMIN'], status: 'รอการตรวจสอบ', progress: 52 },
        { project: 'INVENTORY', roles: ['ADMIN'], status: 'กำลังดำเนินการ', progress: 74 },
        { project: 'TEMPLATE', roles: ['ADMIN'], status: 'เสถียร', progress: 86 },
      ];
    }

    function normalizeState() {
      const userData = readUserData();
      return {
        userName: (userData && userData.user_name) || 'ผู้ใช้งาน',
        projects: computeProjects(userData && userData.projects),
      };
    }

    function mapStatusClass(text) {
      const value = (text || '').toLowerCase();
      if (value.indexOf('รอ') !== -1 || value.indexOf('pending') !== -1) {
        return 'warning';
      }
      if (
        value.indexOf('สำเร็จ') !== -1 ||
        value.indexOf('เสร็จ') !== -1 ||
        value.indexOf('success') !== -1
      ) {
        return 'success';
      }
      if (
        value.indexOf('ปัญหา') !== -1 ||
        value.indexOf('ผิดพลาด') !== -1 ||
        value.indexOf('error') !== -1
      ) {
        return 'danger';
      }
      return 'info';
    }

    function formatRoles(roles) {
      if (!roles || !roles.length) {
        return 'ยังไม่มีบทบาทที่ระบุ';
      }
      return roles.join(', ');
    }

    function generateActivities(projects) {
      const base = [
        {
          icon: 'fa-check-circle',
          tone: 'success',
          title: 'ระบบพร้อมใช้งาน',
          detail: 'ไม่มีเหตุขัดข้องที่ส่งผลกระทบต่อการทำงาน',
          time: 'วันนี้ 08:15 น.',
        },
        {
          icon: 'fa-bell',
          tone: 'warning',
          title: 'แจ้งเตือนการอนุมัติ',
          detail: 'มีรายการที่รอการอนุมัติ 1 รายการ',
          time: 'เมื่อวานนี้',
        },
        {
          icon: 'fa-database',
          tone: 'primary',
          title: 'ข้อมูลล่าสุดถูกซิงก์',
          detail: 'อัพเดตข้อมูลสำเร็จสำหรับ MI2 Data Lake',
          time: '2 วันที่แล้ว',
        },
      ];
      const recentNotes = ['วันนี้', 'เมื่อวานนี้', '3 วันที่แล้ว', '1 สัปดาห์ก่อน'];
      projects.slice(0, 3).forEach(function (project, index) {
        base.unshift({
          icon: 'fa-layer-group',
          tone: 'primary',
          title: 'อัพเดตจาก ' + (project.project || 'MI2 Project'),
          detail: 'บทบาทของคุณ: ' + formatRoles(project.roles),
          time: recentNotes[index % recentNotes.length],
        });
      });
      return base.slice(0, 4);
    }

    function renderDashboard() {
      const state = normalizeState();
      const projectCount = state.projects.length;
      const roleSet = new Set();
      state.projects.forEach(function (project) {
        (project.roles || []).forEach(function (role) {
          roleSet.add(role);
        });
      });
      const roleCount = roleSet.size;

      const heroName = document.getElementById('currentUserName');
      if (heroName) {
        heroName.textContent = state.userName;
      }

      const heroProjectCount = document.getElementById('heroProjectCount');
      if (heroProjectCount) {
        heroProjectCount.textContent = projectCount + ' โปรเจกต์';
      }

      const heroRoleCount = document.getElementById('heroRoleCount');
      if (heroRoleCount) {
        heroRoleCount.textContent = roleCount + ' บทบาท';
      }

      const now = new Date();
      const lastUpdated = document.getElementById('lastUpdatedLabel');
      if (lastUpdated) {
        try {
          lastUpdated.textContent =
            'อัพเดตล่าสุด: ' +
            now.toLocaleString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
        } catch (error) {
          lastUpdated.textContent = 'อัพเดตล่าสุด: ' + now.toLocaleString();
        }
      }

      const metricProjects = document.getElementById('metricProjects');
      if (metricProjects) {
        metricProjects.textContent = projectCount;
      }
      const metricProjectsTrend = document.getElementById('metricProjectsTrend');
      if (metricProjectsTrend) {
        metricProjectsTrend.textContent = projectCount
          ? 'กำลังใช้งาน ' + Math.max(1, projectCount - 1) + ' รายการ'
          : 'ยังไม่มีโปรเจกต์';
      }

      const taskEstimate = Math.max(5, projectCount * 4);
      const metricTasks = document.getElementById('metricTasks');
      if (metricTasks) {
        metricTasks.textContent = taskEstimate;
      }
      const metricTasksTrend = document.getElementById('metricTasksTrend');
      if (metricTasksTrend) {
        metricTasksTrend.textContent =
          'ใกล้กำหนด ' + Math.max(1, Math.round(taskEstimate * 0.25)) + ' งาน';
      }

      const approvalCount = Math.max(1, Math.round(projectCount * 1.5));
      const metricApprovals = document.getElementById('metricApprovals');
      if (metricApprovals) {
        metricApprovals.textContent = approvalCount;
      }
      const metricApprovalsTrend = document.getElementById('metricApprovalsTrend');
      if (metricApprovalsTrend) {
        metricApprovalsTrend.textContent =
          'รอการตรวจสอบ ' + Math.max(0, approvalCount - 1) + ' รายการ';
      }

      const notificationCount = Math.max(0, projectCount - 1);
      const metricNotifications = document.getElementById('metricNotifications');
      if (metricNotifications) {
        metricNotifications.textContent = notificationCount;
      }
      const metricNotificationsTrend = document.getElementById('metricNotificationsTrend');
      if (metricNotificationsTrend) {
        metricNotificationsTrend.textContent = notificationCount
          ? 'แจ้งเตือนใหม่ ' + notificationCount
          : 'ไม่มีแจ้งเตือนใหม่';
      }

      const projectContainer = document.getElementById('projectOverview');
      if (projectContainer) {
        projectContainer.innerHTML = '';
        if (!projectCount) {
          const empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.innerHTML =
            '<i class="fas fa-ghost"></i><p>ยังไม่มีโปรเจกต์ที่เชื่อมโยง</p><small>กรุณาติดต่อผู้ดูแลระบบเพื่อรับสิทธิ์เข้าถึง</small>';
          projectContainer.appendChild(empty);
        } else {
          const recentTimes = ['วันนี้', 'เมื่อวานนี้', '3 วันที่แล้ว', '1 สัปดาห์ก่อน'];
          state.projects.forEach(function (project, index) {
            const card = document.createElement('article');
            card.className = 'project-card';

            const header = document.createElement('header');
            header.className = 'project-header';

            const icon = document.createElement('div');
            icon.className = 'project-icon';
            icon.innerHTML = '<i class="fas fa-briefcase"></i>';
            header.appendChild(icon);

            const headerText = document.createElement('div');

            const title = document.createElement('h3');
            title.className = 'project-title';
            title.textContent = project.project || 'ไม่ระบุชื่อโปรเจกต์';
            headerText.appendChild(title);

            const role = document.createElement('p');
            role.className = 'project-role';
            role.textContent = formatRoles(project.roles);
            headerText.appendChild(role);

            header.appendChild(headerText);

            const status = document.createElement('span');
            const statusText =
              project.status ||
              (index % 3 === 0 ? 'กำลังดำเนินการ' : index % 3 === 1 ? 'รอการตรวจสอบ' : 'เสถียร');
            status.className = 'status-pill ' + mapStatusClass(statusText);
            status.textContent = statusText;
            header.appendChild(status);

            card.appendChild(header);

            const body = document.createElement('div');
            body.className = 'project-body';

            const track = document.createElement('div');
            track.className = 'progress-track';

            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            const progressValue =
              typeof project.progress === 'number'
                ? Math.max(0, Math.min(100, project.progress))
                : Math.min(95, 48 + (index % 4) * 12);
            bar.style.width = progressValue + '%';
            track.appendChild(bar);
            body.appendChild(track);

            const meta = document.createElement('div');
            meta.className = 'project-meta';
            const metaLabel = document.createElement('span');
            metaLabel.textContent = 'ความคืบหน้า';
            const metaValue = document.createElement('span');
            metaValue.textContent = progressValue + '%';
            meta.appendChild(metaLabel);
            meta.appendChild(metaValue);
            body.appendChild(meta);

            card.appendChild(body);

            const footer = document.createElement('footer');
            footer.className = 'project-footer';

            const timeLabel = document.createElement('span');
            timeLabel.innerHTML =
              '<i class="fas fa-clock"></i> อัพเดตล่าสุด ' +
              recentTimes[index % recentTimes.length];
            footer.appendChild(timeLabel);

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-sm btn-outline-primary';
            button.setAttribute('data-bs-toggle', 'modal');
            button.setAttribute('data-bs-target', '#modulesPopup');
            button.textContent = 'เปิดโปรเจกต์';
            footer.appendChild(button);

            card.appendChild(footer);
            projectContainer.appendChild(card);
          });
        }
      }

      const activities = generateActivities(state.projects);
      const activityFeed = document.getElementById('activityFeed');
      if (activityFeed) {
        activityFeed.innerHTML = '';
        activities.forEach(function (activity) {
          const item = document.createElement('li');
          item.className = 'activity-item';

          const icon = document.createElement('div');
          icon.className = 'activity-icon ' + (activity.tone || 'primary');
          icon.innerHTML = '<i class="fas ' + activity.icon + '"></i>';
          item.appendChild(icon);

          const detail = document.createElement('div');
          detail.className = 'activity-detail';

          const title = document.createElement('p');
          title.className = 'activity-title';
          title.textContent = activity.title;
          detail.appendChild(title);

          const meta = document.createElement('span');
          meta.className = 'activity-meta';
          meta.textContent = activity.detail + ' • ' + activity.time;
          detail.appendChild(meta);

          item.appendChild(detail);
          activityFeed.appendChild(item);
        });
      }

      const progressActiveBar = document.getElementById('progressActiveBar');
      const progressActiveValue = document.getElementById('progressActiveValue');
      if (progressActiveBar && progressActiveValue) {
        const value = projectCount ? Math.min(100, Math.max(25, projectCount * 22)) : 0;
        progressActiveBar.style.width = value + '%';
        progressActiveValue.textContent = value + '%';
      }

      const progressReviewBar = document.getElementById('progressReviewBar');
      const progressReviewValue = document.getElementById('progressReviewValue');
      if (progressReviewBar && progressReviewValue) {
        const value = projectCount ? Math.min(100, Math.max(15, projectCount * 12)) : 0;
        progressReviewBar.style.width = value + '%';
        progressReviewValue.textContent = value + '%';
      }

      const progressCompletedValue = document.getElementById('progressCompletedValue');
      if (progressCompletedValue) {
        const value = projectCount ? Math.max(1, Math.round(projectCount * 0.6)) : 0;
        progressCompletedValue.textContent = value + ' โปรเจกต์เสร็จสมบูรณ์';
      }
    }

    renderDashboard();

    const refreshProjects = document.getElementById('refreshProjects');
    if (refreshProjects) {
      refreshProjects.addEventListener('click', function (event) {
        event.preventDefault();
        renderDashboard();
      });
    }

    const viewActivityLink = document.getElementById('viewActivityLink');
    if (viewActivityLink) {
      viewActivityLink.addEventListener('click', function (event) {
        const targetSelector = viewActivityLink.getAttribute('href');
        if (targetSelector && targetSelector.indexOf('#') === 0) {
          const target = document.querySelector(targetSelector);
          if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    }
  });
});
